import type { ExecutorContext } from "@nrwl/devkit"
import { exec } from "child_process"
import { promisify } from "util"
import { throwIfError } from "@ha/shell-utils"

interface TelepresenceExecutorOptions {
  port: number
  serviceName?: string
}

async function executor(
  options: TelepresenceExecutorOptions = {
    port: 8080,
  },
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const command = `telepresence intercept "${
      context.projectName
    }" --service "${
      options.serviceName ?? context.projectName
    }" --env-file intercept.env --port ${options.port}:${
      options.port
    } -- /bin/bash -c yarn start/dev ${context.projectName};`
    const commandChildProcess = await promisify(exec)(command)
    throwIfError({
      ...commandChildProcess,
      code: !!commandChildProcess.stderr ? 1 : 0,
    })
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { TelepresenceExecutorOptions }
