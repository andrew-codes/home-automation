import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import type { ExecutorContext } from "@nrwl/devkit"
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
    process.on("exit", () => {
      console.log("Stopping telepresence.")
      sh.exec(`telepresence uninstall --agent ${context.projectName}`)
    })
    const command = `telepresence intercept "${
      context.projectName
    }" --service "${options.serviceName ?? context.projectName}" --port ${
      options.port
    }:${options.port} --mount=/tmp/ -- yarn start/dev ${context.projectName};`
    throwIfError(sh.exec(command))
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { TelepresenceExecutorOptions }
