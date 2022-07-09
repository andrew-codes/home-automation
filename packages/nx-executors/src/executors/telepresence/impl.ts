import path from "path"
import sh from "shelljs"
import { createConfigurationApi } from "@ha/configuration-workspace"
import type { ExecutorContext } from "@nrwl/devkit"
import { throwIfError } from "@ha/shell-utils"

interface TelepresenceExecutorOptions {
  image: string
  port: number
  serviceName?: string
  envOverrides?: string[]
  volumes?: string[]
}

async function executor(
  options: TelepresenceExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    if (!context.projectName || !options.port || !options.image) {
      return { success: false }
    }

    process.on("exit", () => {
      console.log("Stopping telepresence.")
      sh.exec(`telepresence uninstall --agent ${context.projectName}`)
    })
    const configApi = await createConfigurationApi()
    const k8sUsername = 'root'
    const k8sIp = await configApi.get("k8s/main-node/ip")
    const mountSshfsCommand = `sshfs ${k8sUsername}@${k8sIp}:/mnt/data/${context.projectName} /tmp/${context.projectName} -o umask=0644`
    sh.exec(`mkdir -p /tmp/${context.projectName}`)
    sh.exec(mountSshfsCommand)

    const command = `telepresence intercept "${
      context.projectName
    }" --service "${options.serviceName ?? context.projectName}" --port ${
      options.port
    }:${options.port} --mount false --docker-run -- --rm --name ${
      context.projectName
    } ${(options.envOverrides ?? [])
      .map((override) => `--env ${override}`)
      .join(" ")} --env TELEPRESENCE_ROOT=/tmp/${context.projectName} ${(
      options.volumes ?? []
    )
      .map((v) => `-v ${path.resolve(context.root, v)}`)
      .join(" ")} -v "${path.resolve("/", "tmp", context.projectName)}:/tmp/${
      context.projectName
    }" ${options.image}`

    console.log(command)
    throwIfError(sh.exec(command))
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { TelepresenceExecutorOptions }
