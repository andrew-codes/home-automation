import fs from "fs"
import path from "path"
import sh from "shelljs"
import { createConfigurationApi } from "@ha/configuration-workspace"
import type { ExecutorContext } from "@nrwl/devkit"
import { spawn } from "child_process"
import { throwIfError } from "@ha/shell-utils"

interface TelepresenceExecutorOptions {
  command: string
  port: number
  serviceName?: string
}

async function executor(
  options: TelepresenceExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    if (!context.projectName) {
      return { success: false }
    }

    const command = `telepresence intercept "${
      context.projectName
    }" --service "${options.serviceName ?? context.projectName}" --port ${
      options.port
    }:${options.port} --mount false -- ${options.command}`
    throwIfError(sh.exec(command))
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { TelepresenceExecutorOptions }
