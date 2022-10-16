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
  const registry = await configurationApi.get("docker/registry/hostname")
  // const username = await configurationApi.get("azure/client/id")
  // const password = await configurationApi.get("azure/client/secret")
  // throwIfError(
  //   sh.exec(
  //     `docker login ${registry} --username ${username} --password ${password};`,
  //     { silent: true },
  //   ),
  // )

  return {
    build: async (name, options = {}) => {
      throwIfError(
        sh.exec(
          `docker build -t ${registry}/${name} ${
            options.context ?? process.cwd()
          } -f ${options.dockerFile ?? "Dockerfile"};`,
          { silent: true },
        ),
      )
    },
    pushImage: async (name) => {
      throwIfError(
        sh.exec(`docker push ${registry}/${name};`, { silent: true }),
      )
    },
  }
}

export { createClient }
export type { DockerClient }
