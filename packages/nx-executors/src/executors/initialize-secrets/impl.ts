import type { ExecutorContext } from "@nrwl/devkit"
import { exec } from "child_process"
import { promisify } from "util"
import throwIfError from "../throwIfProcessError"

interface InitializeSecretsExectutorOptions {
  secrets: string[]
  keyVaultName?: string
}

async function executor(
  { secrets, keyVaultName }: InitializeSecretsExectutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const azLoginCommand = `pushd .
    cd ../../
    set -o allexport
    source .secrets.env
    set +o allexport
    popd
    
    az login --service-principal --username $AZURE_SERVICE_PRINCIPAL_APP_ID --password $AZURE_SERVICE_PRINCIPAL_PASSWORD --tenant $AZURE_SERVICE_PRINCIPAL_TENANT
    az account set --subscription $AZURE_SUBSCRIPTION_ID`
    const connectChildProcess = await promisify(exec)(azLoginCommand)
    throwIfError(connectChildProcess)

    for (const secret of secrets) {
      const command = `az keyvault secret set --vault-name ${keyVaultName} --name "${secret}" --value "change me"`
      const connectChildProcess = await promisify(exec)(azLoginCommand)
      throwIfError(connectChildProcess)
    }
  } catch (error) {
    console.log(error)
    return { success: false }
  }
  return { success: true }
}

export default executor
export type { InitializeSecretsExectutorOptions }
