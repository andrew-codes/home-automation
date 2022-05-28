import { ConfigurationApi } from "@ha/configuration-api"
import { SecretClient } from "@azure/keyvault-secrets"
import { UsernamePasswordCredential } from "@azure/identity"
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"

type AzureKvConfiguration = {}

const configurationApi: ConfigurationApi<AzureKvConfiguration> = {
  get: async (name) => {
    const keyVaultName = await EnvSecretsConfiguration.get("azureKeyVaultName")
    const tenantId = await EnvSecretsConfiguration.get(
      "azureServicePrincipalTenant",
    )
    const clientId = await EnvSecretsConfiguration.get(
      "azureServicePrincipalAppId",
    )
    const username = await EnvSecretsConfiguration.get(
      "azureServicePrincipalName",
    )
    const password = await EnvSecretsConfiguration.get(
      "azureServicePrincipalPassword",
    )
    const subscriptionId = await EnvSecretsConfiguration.get(
      "azureSubscriptionId",
    )
    const credential = new UsernamePasswordCredential(
      tenantId,
      clientId,
      username,
      password,
    )
    const url = "https://" + keyVaultName + ".vault.azure.net"
    const client = new SecretClient(url, credential)
    const secret = await client.getSecret(name)
    return secret.value as AzureKvConfiguration[typeof name]
  },
}

export type { AzureKvConfiguration as Configuration }
export { configurationApi }
