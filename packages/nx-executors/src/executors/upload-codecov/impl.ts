import type { ExecutorContext } from "@nrwl/devkit"
import { exec } from "child_process"
import { promisify } from "util"
import throwIfError from "../throwIfProcessError"

interface UploadCodeCovOptions {
  coverageFilePath: string
}

async function executor(
  options: UploadCodeCovOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const command = `codecov --file ${options.coverageFilePath} --name ${context.projectName}`
    const commandChildProcess = await promisify(exec)(command)
    throwIfError(commandChildProcess)
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { UploadCodeCovOptions }
