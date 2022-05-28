jest.mock("@ha/configuration-azure-kv")
jest.mock("@ha/configuration-static")
import { configurationApi as azureKvConfiguration } from "@ha/configuration-azure-kv"
import { configurationApi as staticConfiguration } from "@ha/configuration-static"
import { ConfigurationApi } from "packages/configuration-api/src"
import * as sut from ".."

describe("configuration api module exports", () => {
  test("Created configuration API will throw error if configuration value cannot be found by name.", async () => {
    jest.mocked(staticConfiguration, true)
    staticConfiguration.get.mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi()
    try {
      await api.get("azureKeyVaultName")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toEqual(
        "Configuration value not found, azureKeyVaultName.",
      )
    }
  })

  test("Created configuration API will return configuration value from the first provider that does not throw an error.", async () => {
    jest.mocked(staticConfiguration, true)
    staticConfiguration.get.mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi([
      staticConfiguration,
      TestConfigProvder,
      TestConfigProvder2,
    ])

    const actual = await api.get("azureKeyVaultName")
    expect(actual).toEqual("value")
  })

  test("Created configuration API defaults to providers (in order): static, azure key vault providers.", async () => {
    jest.mocked(staticConfiguration, true)
    jest.mocked(azureKvConfiguration, true)
    staticConfiguration.get.mockRejectedValue("Configuration value not found.")
    azureKvConfiguration.get.mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi()

    try {
      const actual = await api.get("azureKeyVaultName")
    } catch (error) {}
    expect(staticConfiguration.get).toHaveBeenCalledWith("azureKeyVaultName")
    expect(azureKvConfiguration.get).toHaveBeenCalledWith("azureKeyVaultName")
  })
})

const TestConfigProvder: ConfigurationApi<{ azureKeyVaultName: string }> = {
  get: async (name) => "value",
}

const TestConfigProvder2: ConfigurationApi<{ azureKeyVaultName: string }> = {
  get: async (name) => "different value",
}
