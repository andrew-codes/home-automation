import path from 'path'
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
    let modulePath = path.resolve(context.root, module)
    if (!!cwd) {
      modulePath = path.resolve(context.root, cwd, module)
    }
    const loadedModule = require(modulePath)
    const configApi = await createConfigurationApi()
    await loadedModule.default(configApi)
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { InvokeExecutorOptions }
