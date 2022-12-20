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
  try {
    console.log("Starting local")
    if (!context.projectName) {
      return { success: false }
    }

    const command = `telepresence intercept "${
      context.projectName
    }" --service "${options.serviceName ?? context.projectName}" --port ${
      options.fromPort
    }:${options.toPort} --mount false -- ${options.command}`
    await throwIfError(sh.exec(command, { cwd: options.cwd }))
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { TelepresenceExecutorOptions }
