import path from "path"
import process from "process"
import type { ExecutorContext } from "@nrwl/devkit"
import { createConfigurationApi } from "@ha/configuration-workspace"
import { register } from "esbuild-register/dist/node"

interface InvokeExecutorOptions {
  module: string
  cwd?: string
}

async function executor(
  { module, cwd }: InvokeExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    register()
    let currentDir = path.resolve(context.root)
    if (!!cwd) {
      currentDir = path.resolve(context.root, cwd)
    }
    const loadedModule = require(path.resolve(currentDir, module))
    const configApi = await createConfigurationApi()
    process.chdir(currentDir)
    await loadedModule.default(configApi)
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { InvokeExecutorOptions }
