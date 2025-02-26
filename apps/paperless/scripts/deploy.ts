import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const port_external = await configurationApi.get("paperless/port/external")
  const secrets: Array<keyof Configuration> = [
    "paperless/postgres-db",
    "paperless/postgres-password",
    "paperless/postgres-user",
    "paperless/secret-key",
    "paperless/url",
    "paperless/admin/user",
    "paperless/admin/mail",
    "paperless/admin/password",
  ]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: "ghcr.io/paperless-ngx/paperless-ngx:latest",
      name: "paperless",
      secrets,
      port: parseInt(port_external.value),
    },
  )
  const resourceJson = JSON.parse(resources)
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)
  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kube.rolloutDeployment("restart", "paperless")
}

export default run
