import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker/registry/hostname")
  const repositoryOwner = await configurationApi.get("repository/owner")
  const repositoryName = await configurationApi.get("repository/name")
  const port = await configurationApi.get("home-assistant/port/external")
  const secrets: Array<keyof Configuration> = [
    "mqtt/password",
    "mqtt/username",
    "home-assistant/appdaemon/password",
    "home-assistant/appdaemon/url",
    "home-assistant/domain",
    "home-assistant/double-take/token",
    "home-assistant/elevation",
    "home-assistant/game-room/gaming-pc/ip",
    "home-assistant/game-room/gaming-pc/mac",
    "home-assistant/game-room/gaming-pc/machine-username",
    "home-assistant/game-room/nvidia-shield/ip",
    "home-assistant/game-room/playstation-5/ip",
    "home-assistant/game-room/tv/ip",
    "home-assistant/game-room/tv/mac",
    "home-assistant/github/token",
    "home-assistant/google/calendar/client-id",
    "home-assistant/google/calendar/client-secret",
    "home-assistant/ssh-key/private",
    "home-assistant/ssh-key/public",
    "home-assistant/influxdb/token",
    "home-assistant/jira-authorization-header",
    "home-assistant/latitude",
    "home-assistant/longitude",
    "home-assistant/port/external",
    "home-assistant/postgres/db",
    "home-assistant/postgres/password",
    "home-assistant/postgres/username",
    "home-assistant/spotcast/dc-2",
    "home-assistant/spotcast/dc",
    "home-assistant/spotcast/key-2",
    "home-assistant/spotcast/key",
    "home-assistant/spotify/client-id",
    "home-assistant/spotify/client-secret",
    "home-assistant/time-zone",
    "home-assistant/token",
    "home-assistant/unit-system",
    "home-assistant/url",
    "home-assistant/withings/client-id",
    "home-assistant/withings/client-secret",
    "unifi/ip",
    "unifi/password",
    "unifi/username",
  ]
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registry}/${name}:latest`,
      name,
      postgresImage: "postgres:13.3-alpine",
      repositoryName,
      repositoryOwner,
      registryHostname: registry,
      port,
      secrets,
    },
  )
  const resourceJson = JSON.parse(resources)
  resourceJson.forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
