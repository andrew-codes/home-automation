import type { ExecutorContext } from "@nrwl/devkit"
import { createConfigurationApi } from "@ha/configuration-workspace"
import { register } from "esbuild-register/dist/node"

interface RunWithAzExecutorOptions {
  module: string
  cwd?: string
}

async function executor(
  { module, cwd }: RunWithAzExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    register()
    const { default: loadedModule } = await import(module)
    const configApi = await createConfigurationApi()
    await loadedModule(configApi)
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { RunWithAzExecutorOptions }
