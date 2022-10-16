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
  const registry = await configurationApi.get("docker-registry/hostname")
  const repo_owner = await configurationApi.get("repository/owner")
  const repo_name = await configurationApi.get("repository/name")
  const resources = await jsonnet.eval(
    path.join(__dirname, "..", "deployment", "index.jsonnet"),
    {
      image: `${registry}/${name}:latest`,
      secrets: JSON.stringify([]),
      repository_name: `${repo_owner}/${repo_name}`,
    },
  )

  const githubToken = await configurationApi.get("github/token")
  sh.exec(`kubectl create namespace actions-runner-system;`, { silent: true })
  sh.exec(
    `kubectl delete secret controller-manager --namespace=actions-runner-system;`,
    { silent: true },
  )
  throwIfError(
    sh.exec(
      `kubectl create secret generic controller-manager --namespace=actions-runner-system --from-literal=github_token="${githubToken}";`,
      { silent: true },
    ),
  )

  sh.exec(
    `kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.8.0/cert-manager.yaml;`,
    { silent: true },
  )

  sh.exec(
    `kubectl create -f https://github.com/actions-runner-controller/actions-runner-controller/releases/download/v0.24.1/actions-runner-controller.yaml;`,
    { silent: true },
  )
  const seal = createSeal(githubToken)

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

  await Promise.all(
    secrets.map(async (secretName, index) => {
      const secretValue = await configurationApi.get(secretName)

      return await seal(repo_owner, repo_name, names[index], secretValue)
    }),
  )

  await seal(repo_owner, repo_name, "JEST_REPORTER_TOKEN", githubToken)

  const resourceJson = JSON.parse(resources)
  resourceJson.forEach((resource) => {
    kubectl.applyToCluster(JSON.stringify(resource))
  })

  kubectl.rolloutDeployment("restart", "controller-manager", {
    namespace: "actions-runner-system",
  })
}

export default run
