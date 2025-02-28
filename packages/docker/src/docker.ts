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
  const registry = await configurationApi.get("docker-registry/hostname")
  const username = await configurationApi.get("docker-registry/username")
  const password = await configurationApi.get("docker-registry/password")

  return {
    build: async (name, options = {}) => {
      await throwIfError(
        sh.exec(
          `docker build -t ${registry.value}/${name} ${
            options.context ?? process.cwd()
          } -f ${options.dockerFile ?? "Dockerfile"};`,
          { async: true, silent: false },
        ),
      )
    },
    pushImage: async (name) => {
      await throwIfError(
        sh.exec(
          `docker login ${registry.value} --username ${username.value} --password ${password.value}`,
          { async: true, silent: true },
        ),
      )
      await throwIfError(
        sh.exec(`docker push ${registry.value}/${name};`, {
          async: true,
          silent: true,
        }),
      )
    },
  }
}

export { createClient }
export type { DockerClient }
