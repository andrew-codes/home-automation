jest.mock("@ha/configuration-env-secrets")
jest.mock("@azure/keyvault-secrets")
jest.mock("@azure/identity")
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"
import { SecretClient } from "@azure/keyvault-secrets"
import { ClientSecretCredential } from "@azure/identity"
import { when } from "jest-when"
import { createConfigApi } from "../"

describe("configuration api module exports", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const getSecret = jest.fn()
  const setSecret = jest.fn()
  beforeEach(() => {
    jest
      .mocked(SecretClient)
      .mockImplementation(
        () => ({ getSecret, setSecret } as unknown as SecretClient),
      )
  })

  test("Uses the env-secrets configuration api to connect to Azure Key Vault and retrieve the value by name", async () => {
    when(EnvSecretsConfiguration.get)
      .calledWith("azure/key-vault/name")
      .mockResolvedValue("azureKeyVaultName")
    when(EnvSecretsConfiguration.get)
      .calledWith("azure/tenant/id")
      .mockResolvedValue("azureTenantId")
    when(EnvSecretsConfiguration.get)
      .calledWith("azure/client/id")
      .mockResolvedValue("azureClientId")
    when(EnvSecretsConfiguration.get)
      .calledWith("azure/client/secret")
      .mockResolvedValue("azureClientSecret")

    const credential = { creds: true }

    when(ClientSecretCredential)
      .calledWith("azureTenantId", "azureClientId", "azureClientSecret")
      .mockReturnValue(credential)

    when(getSecret)
      .calledWith("mqtt-username")
      .mockResolvedValue({ value: "a username" })

    const api = await createConfigApi()
    const actual = await api.get("mqtt/username")

    expect(SecretClient).toHaveBeenCalledWith(
      "https://azureKeyVaultName.vault.azure.net",
      credential,
    )
    expect(actual).toEqual("a username")
  })

  test("Can set a configutation value via saving it to Azure Key Vault.", async () => {
    const api = await createConfigApi()
    await api.set("azure/location", "new location")

    expect(setSecret).toHaveBeenCalledWith("azure-location", "new location")
  })
})
