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
  const githubToken = await configurationApi.get("github/token")
  sh.exec(`kubectl create namespace actions-runner-system;`, { silent: true })
  sh.exec(
    `kubectl delete secret controller-manager --namespace=actions-runner-system;`,
    { silent: true },
  )
  await throwIfError(
    sh.exec(
      `kubectl create secret generic controller-manager --namespace=actions-runner-system --from-literal=github_token="${githubToken.value}";`,
      { silent: true },
    ),
  )

  sh.exec(
    `kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.8.0/cert-manager.yaml;`,
    { silent: true },
  )

  sh.exec(
    `kubectl create -f https://github.com/actions-runner-controller/actions-runner-controller/releases/download/v0.26.0/actions-runner-controller.yaml;`,
    { silent: true },
  )
  const seal = createSeal(githubToken.value)

  const secrets: Array<keyof Configuration> = [
    "onepassword/server-url",
    "onepassword/token",
    "onepassword/vault-id",
    "code-cov/token",
  ]
  const names: string[] = [
    "ONEPASSWORD_SERVER_URL",
    "ONEPASSWORD_TOKEN",
    "ONEPASSWORD_VAULT_ID",
    "CODE_COV_TOKEN",
  ]

  const registry = await configurationApi.get("docker-registry/hostname")
  const repo_owner = await configurationApi.get("repository/owner")
  const repo_name = await configurationApi.get("repository/name")

  await Promise.all(
    secrets.map(async (secretName, index) => {
      const secretValue = await configurationApi.get(secretName)

      return await seal(
        repo_owner.value,
        repo_name.value,
        names[index],
        typeof secretValue === "string" ? secretValue : secretValue.value,
      )
    }),
  )

  await seal(
    repo_owner.value,
    repo_name.value,
    "JEST_REPORTER_TOKEN",
    githubToken.value,
  )

  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registry.value}/${name}:latest`,
      secrets: JSON.stringify([]),
      repository_name: `${repo_owner.value}/${repo_name.value}`,
    },
  )
  const resourceJson = JSON.parse(resources)
  await Promise.all(
    resourceJson.map((resource) =>
      kubectl.applyToCluster(JSON.stringify(resource)),
    ),
  )

  await kubectl.rolloutDeployment("restart", "controller-manager", {
    namespace: "actions-runner-system",
  })
}

export default run
