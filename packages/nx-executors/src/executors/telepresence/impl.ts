import { doIf } from "@ha/env-utils"
import type { ExecutorContext } from "@nrwl/devkit"
import { exec } from "child_process"
import { identity } from "lodash"
import { promisify } from "util"

export interface EchoExecutorOptions {
  port: number
}

const throwIfError = ({ stdout, stderr }) => {
  console.log(stdout)
  doIf(identity(stderr))(() => {
    throw new Error(stderr)
  })
}

export default async function echoExecutor(
  options: EchoExecutorOptions = { port: 8080 },
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const connectCommand = `telepresence connect`
    const connectChildProcess = await promisify(exec)(connectCommand)
    throwIfError(connectChildProcess)

    const command = `telepresence intercept "${context.projectName}" --service "${context.projectName}" --env-file intercept.env --port ${options.port}:80 -- /bin/bash -c 'DEBUG=@ha/${context.projectName}/*' yarn start/dev ${context.projectName}`
    const commandChildProcess = await promisify(exec)(command)
    throwIfError(commandChildProcess)
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}
