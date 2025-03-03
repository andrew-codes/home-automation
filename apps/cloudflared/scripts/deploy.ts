import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { logger } from "@ha/logger"
import { throwIfError } from "@ha/shell-utils"
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import yaml from "yaml"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const domain = (await configurationApi.get("domain")).value
  let config = (await configurationApi.get("cloudflared/config")).value
  let credentials = (await configurationApi.get("tunnel-proxy/auth")).value

  if (!config) {
    config = `tunnel: id
credentials-file: "/etc/cloudflared/creds/credentials.json"
ingress: []`
  }

  if (!credentials) {
    logger.debug(
      "Cloudflared config or credentials not found. Creating a new tunnel.",
    )
    const tunnelCreation = await throwIfError(
      sh.exec(
        `cloudflared tunnel create ${domain} --output json --credentials-file ./.secrets/credentials.json`,
        { silent: true },
      ),
    )

    // Extract the path to the credentials file and the tunnel ID
    const credentialsFilePathMatch = tunnelCreation.match(
      /Tunnel credentials written to (.+)\./,
    )
    const tunnelIdMatch = tunnelCreation.match(
      /Created tunnel .+ with id ([a-f0-9-]+)/,
    )

    if (!credentialsFilePathMatch || !tunnelIdMatch) {
      throw new Error("Failed to extract tunnel ID or credentials file path")
    }

    const credentialsFilePath = credentialsFilePathMatch[1]
    const tunnelId = tunnelIdMatch[1]

    logger.debug(`Tunnel ID: ${tunnelId}`)
    logger.debug(`Credentials File Path: ${credentialsFilePath}`)

    credentials = await fs.readFile(credentialsFilePath, "utf8")

    config = config
      .replace(/tunnel: .*/, `tunnel: ${tunnelId}`)
      .replace(/\n/g, "\\n")
    configurationApi.set("cloudflared/config", config)
    configurationApi.set("tunnel-proxy/auth", credentials)
  }

  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)
  try {
    await kube.exec(`kubectl delete secret tunnel-credentials`)
  } catch (e) {
    logger.warn("tunnel-credentials secret may not exist.")
  }
  await kube.exec(
    `kubectl create secret generic tunnel-credentials --from-literal=credentials.json='${credentials}';`,
  )

  config = config.replace(/\\n/g, "\n")
  const secrets: Array<keyof Configuration> = []
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "src", "deployment", "index.jsonnet"),
    {
      secrets,
      config: config,
    },
  )
  const resourceJson = JSON.parse(resources)

  await Promise.all(
    resourceJson.map((resource) =>
      kube.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kube.rolloutDeployment("restart", "cloudflared")

  const parsedConfig: {
    tunnel?: string
    ingress?: Array<{ hostname?: string }>
  } = yaml.parse(config)

  if (parsedConfig?.tunnel) {
    const proxiedDomains =
      parsedConfig?.ingress
        ?.map(({ hostname }) => hostname)
        .filter((hostname) => !!hostname)
        .map((hostname) => hostname?.split(".")[0]) || []

    for (const hostname of proxiedDomains) {
      logger.info(
        `Proxying domain: ${hostname} for tunnel ${parsedConfig.tunnel}`,
      )
      try {
        await throwIfError(
          sh.exec(
            `cloudflared tunnel route dns ${parsedConfig.tunnel} ${hostname}`,
          ),
        )
      } catch (e) {
        logger.error(`Failed to update DNS to proxy domain: ${hostname}`)
      }
    }
  }
}

export default run
