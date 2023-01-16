import fs from "fs"
import path from "path"
import type { ExecutorContext } from "@nrwl/devkit"
import { exec } from "child_process"
import { promisify } from "util"
import { throwIfError } from "@ha/shell-utils"

interface UploadCodeCovOptions {
  coverageFilePath: string
}

async function executor(
  options: UploadCodeCovOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const codeCovPath = path.join(context.root, "codecov")
    const codeCovFileExists = fs.existsSync(codeCovPath)
    if (!codeCovFileExists) {
      console.log("No codecov comand, downloading uploader")
      const curlCommand = `curl -s -o ${codeCovPath} https://uploader.codecov.io/latest/linux/codecov && chmod +x ${codeCovPath}`
      const curlCommandChildProcess = await promisify(exec)(curlCommand)
      await throwIfError({
        ...curlCommandChildProcess,
        code: !!curlCommandChildProcess.stderr ? 1 : 0,
      })
    }

    const command = `${codeCovPath} --file ${options.coverageFilePath} --name ${context.projectName};`
    const commandChildProcess = await promisify(exec)(command)
    await throwIfError({
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
export type { UploadCodeCovOptions }
