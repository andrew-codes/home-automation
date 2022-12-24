import sh from "shelljs"
import type { ExecutorContext } from "@nrwl/devkit"
import { throwIfError } from "@ha/shell-utils"

interface TelepresenceExecutorOptions {
  command: string
  cwd: string
  fromPort: number
  toPort: number
  serviceName?: string
}

async function executor(
  options: TelepresenceExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const serviceName = options.serviceName ?? context.projectName

  try {
    console.log("Starting local", serviceName)
    if (!context.projectName) {
      return { success: false }
    }
    sh.exec(`telepresence leave ${serviceName}`)

    const command = `telepresence intercept "${context.projectName}" --service "${serviceName}" --port ${options.fromPort}:${options.toPort} --mount false -- ${options.command}`
    await throwIfError(sh.exec(command, { cwd: options.cwd }))
  } catch (error) {
    console.log("Error occurred", error)
    sh.exec(`telepresence leave ${serviceName}`)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { TelepresenceExecutorOptions }
