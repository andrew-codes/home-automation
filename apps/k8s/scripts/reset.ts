import { runPlaybook } from "@ha/ansible"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import path from "path"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const ip = (await configurationApi.get("k8s/main-node/ip")).value

  const vars = {}
  await runPlaybook(
    path.join(
      __dirname,
      "..",
      "src",
      "deployment",
      "playbooks",
      "reset-k8s.yml",
    ),
    [ip],
    vars,
  )
}

export default run
