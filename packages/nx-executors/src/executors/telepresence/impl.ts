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
    const connectCommand = `telepresence connect`
    const connectChildProcess = await promisify(exec)(connectCommand)
    throwIfError(connectChildProcess)

    const command = `telepresence intercept "${
      context.projectName
    }" --service "${
      options.serviceName ?? context.projectName
    }" --env-file intercept.env --port ${
      options.port
    }:80 -- /bin/bash -c 'DEBUG=@ha/${context.projectName}/*' yarn start/dev ${
      context.projectName
    }`
    const commandChildProcess = await promisify(exec)(command)
    throwIfError(commandChildProcess)
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { TelepresenceExecutorOptions }
