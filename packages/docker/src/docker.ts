import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import process from "process"
import sh from "shelljs"

type DockerBuildOptions = {
  context?: string
  dockerFile?: string
}

interface DockerClient {
  build(name: string, options?: DockerBuildOptions): Promise<void>
  pushImage(name: string): Promise<void>
}

const createClient = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<DockerClient> => {
  const registry = (await configurationApi.get("docker-registry/hostname"))
    .value
  const username = (await configurationApi.get("docker-registry/username"))
    .value
  const password = (await configurationApi.get("docker-registry/password"))
    .value
  const registryScope = (await configurationApi.get("docker-registry/name"))
    .value
  const repo = (await configurationApi.get("repository/name")).value

  return {
    build: async (name, options = {}) => {
      await throwIfError(
        sh.exec(
          `docker buildx build --build-arg OWNER=${username} --build-arg REPO=${repo} --load --platform linux/amd64 -t ${registryScope}/${name} ${
            options.context ?? process.cwd()
          } -f ${options.dockerFile ?? "Dockerfile"};`,
          { async: true, silent: false },
        ),
      )
    },
    pushImage: async (name) => {
      await throwIfError(
        sh.exec(
          `docker login ${registry} --username ${username} --password ${password}`,
          {
            async: true,
            silent: true,
          },
        ),
      )
      await throwIfError(
        sh.exec(`docker push ${registryScope}/${name};`, {
          async: true,
          silent: true,
        }),
      )
    },
  }
}

export { createClient }
export type { DockerClient }
