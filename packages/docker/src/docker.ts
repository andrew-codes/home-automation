import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import process from "process"
import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"

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

  await throwIfError(
    sh.exec(
      `docker login ${registry.value} --username ${username.value} --password ${password.value};`,
      { silent: true },
    ),
  )

  return {
    build: async (name, options = {}) => {
      await throwIfError(
        sh.exec(
          `docker build -t ${registry.value}/${name} ${
            options.context ?? process.cwd()
          } -f ${options.dockerFile ?? "Dockerfile"};`,
          { silent: true },
        ),
      )
    },
    pushImage: async (name) => {
      await throwIfError(
        sh.exec(`docker push ${registry.value}/${name};`, { silent: true }),
      )
    },
  }
}

export { createClient }
export type { DockerClient }
