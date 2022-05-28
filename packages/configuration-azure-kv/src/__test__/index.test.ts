jest.mock("@ha/configuration-env-secrets")
jest.mock("@azure/keyvault-secrets")
jest.mock("@azure/identity")
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"
import { SecretClient } from "@azure/keyvault-secrets"
import { ClientSecretCredential } from "@azure/identity"
import { when } from "jest-when"
import { configurationApi } from "../"

describe("configuration api module exports", () => {
  test("Uses the env-secrets configuration api to connect to Azure Key Vault and retrieve the value by name", async () => {
    when(EnvSecretsConfiguration.get)
      .calledWith("azureKeyVaultName")
      .mockResolvedValue("azureKeyVaultName")
    when(EnvSecretsConfiguration.get)
      .calledWith("azureTenantId")
      .mockResolvedValue("azureTenantId")
    when(EnvSecretsConfiguration.get)
      .calledWith("azureClientId")
      .mockResolvedValue("azureClientId")
    when(EnvSecretsConfiguration.get)
      .calledWith("azureClientSecret")
      .mockResolvedValue("azureClientSecret")

    const credential = { creds: true }
    const getSecret = jest.fn()
    when(ClientSecretCredential)
      .calledWith("azureTenantId", "azureClientId", "azureClientSecret")
      .mockReturnValue(credential)
    when(SecretClient)
      .calledWith("https://azureKeyVaultName.vault.azure.net", credential)
      .mockReturnValue({
        getSecret,
      })
    when(getSecret)
      .calledWith("mqtt-USERNAME")
      .mockResolvedValue({ value: "a username" })

    const actual = await configurationApi.get("mqtt-USERNAME")
    expect(actual).toEqual("a username")
  })
})
