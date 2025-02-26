import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { logger } from "@ha/logger"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  logger.info("Deploying Pi-hole")
  const ip = (await configurationApi.get("pihole/ip")).value
  const ip2 = (await configurationApi.get("pihole2/ip")).value
  const password = (await configurationApi.get("pihole/password")).value
  const domain = (await configurationApi.get("pihole/domain")).value

  const deploymentPath = path.join(__dirname, "..", "src", "deployment")
  await runPlaybook(path.join(deploymentPath, "index.yml"), [ip, ip2], {
    pihole_password: password,
    domain,
  })

  // const resources = await jsonnet.eval(
  //   path.join(deploymentPath, "service.jsonnet"),
  //   {
  //     ip1: ip,
  //     ip2: ip2,
  //   },
  // )
  // const resourceJson = JSON.parse(resources)
  // const kubeConfig = (await configurationApi.get("k8s/config")).value
  // const kube = kubectl(kubeConfig)
  // await Promise.all(
  //   resourceJson.map((resource) =>
  //     kube.applyToCluster(JSON.stringify(resource)),
  //   ),
  // )
}

export default run
