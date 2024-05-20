import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"

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
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", "paperless")
}

export default run
