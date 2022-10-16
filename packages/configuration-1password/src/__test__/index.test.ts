jest.mock("@ha/configuration-env-secrets")
jest.mock("@azure/keyvault-secrets")
jest.mock("@1password/connect")
import { configurationApi as EnvSecretsConfiguration } from "@ha/configuration-env-secrets"
import { OnePasswordConnect } from "@1password/connect"
import { when } from "jest-when"
import { createConfigApi } from "../"

describe("configuration api module exports", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const getItemByTitle = jest.fn()

  test("Uses the env-secrets configuration api to connect to Azure Key Vault and retrieve the value by name", async () => {
    when(EnvSecretsConfiguration.get)
      .calledWith("onepassword/token")
      .mockResolvedValue("token")
    when(EnvSecretsConfiguration.get)
      .calledWith("onepassword/vault-id")
      .mockResolvedValue("vault-id")
    when(EnvSecretsConfiguration.get)
      .calledWith("onepassword/server-url")
      .mockResolvedValue("ip:port")

    when(OnePasswordConnect)
      .calledWith({
        serverURL: "ip:port",
        token: "token",
        keepAlive: true,
      })
      .mockReturnValue({
        getItemByTitle,
      } as unknown as typeof OnePasswordConnect)

    when(getItemByTitle)
      .calledWith("vault-id", "docker-registry/name")
      .mockResolvedValue({ fields: [{ label: "secret-value", value: "name" }] })

    const api = await createConfigApi()
    const actual = await api.get("docker-registry/name")
    expect(actual).toEqual("name")
  })

  test.skip("Can set a configutation value via saving it to Azure Key Vault.", async () => {})
})
