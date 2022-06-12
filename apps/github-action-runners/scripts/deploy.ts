import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import sh from "shelljs"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { throwIfError } from "@ha/shell-utils"
import { createSeal } from "@ha/github-secrets"
import { name } from "./config"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const registry = await configurationApi.get("docker/registry/hostname")
  const repo_owner = await configurationApi.get("repository/owner")
  const repo_name = await configurationApi.get("repository/name")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registry}/${name}:latest`,
      name,
      secrets: JSON.stringify([]),
      repository_name: `${repo_owner}/${repo_name}`,
    },
  )

  const githubToken = await configurationApi.get("github/token")
  sh.exec(
    `kubectl delete secret controller-manager --namespace=actions-runner-system`,
  )
  throwIfError(
    sh.exec(
      `kubectl create secret generic controller-manager --namespace=actions-runner-system --from-literal=github_token="${githubToken}" || true;`,
    ),
  )

  sh.exec(
    `kubectl apply -f https://github.com/actions-runner-controller/actions-runner-controller/releases/download/v0.20.2/actions-runner-controller.yaml`,
  )
  const seal = createSeal(githubToken)
  const mqttPassword = await configurationApi.get("mqtt/password")
  const mqttUsername = await configurationApi.get("mqtt/username")
  const mqttHost = await configurationApi.get("k8s/main-node/ip")
  const mqttPort = await configurationApi.get("mqtt/port/external")

  const secrets: Array<keyof Configuration> = [
    "home-assistant/game-room/gaming-pc/mac",
    "k8s/machine/password",
    "docker/registry/hostname",
  ]
  const names: string[] = [
    "GAMING_ROOM_GAMING_PC_MAC",
    "MACHINE_PASSWORD",
    "DOCKER_REGISTRY_HOSTNAME",
  ]

  await Promise.all(
    secrets.map(async (secretName, index) => {
      const secretValue = await configurationApi.get(secretName)

      return await seal(repo_owner, repo_name, names[index], secretValue)
    }),
  )

  const mqttConnection = `
  $MQTT_HOST = "${mqttHost}"
  $MQTT_PORT = ${mqttPort}
  $MQTT_USERNAME = "${mqttUsername}"
  $MQTT_PASSWORD = "${mqttPassword}"`
  await seal(repo_owner, repo_name, "MQTT_CONNECTION", mqttConnection)
  await seal(repo_owner, repo_name, "JEST_REPORTER_TOKEN", githubToken)

  const resourceJson = JSON.parse(resources)
  Object.values(resourceJson).forEach((resource) => {
    console.log(JSON.stringify(resource))
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", name)
}

export default run
