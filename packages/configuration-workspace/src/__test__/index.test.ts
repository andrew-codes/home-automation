jest.mock("@ha/configuration-azure-kv")
jest.mock("@ha/configuration-static")
import { createConfigApi as createAzureKvConfiguration } from "@ha/configuration-azure-kv"
import { configurationApi as staticConfiguration } from "@ha/configuration-static"
import { ConfigurationApi } from "@ha/configuration-api"
import * as sut from ".."
import { Configuration } from "../Configuration.types"

describe("configuration api module exports", () => {
  beforeEach(() => {
    jest.restoreAllMocks
  })

  const get = jest.fn()
  const getNames = jest.fn()
  const set = jest.fn()
  beforeEach(() => {
    jest.mocked(createAzureKvConfiguration).mockResolvedValue({
      get,
      getNames,
      set,
    } as unknown as ConfigurationApi<any>)
  })

  test("Created configuration API will throw error if configuration value cannot be found by name.", async () => {
    jest.mocked(staticConfiguration, true)
    jest
      .mocked(staticConfiguration.get)
      .mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi()
    try {
      await api.get("mqtt/username")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toEqual(
        "Configuration value not found, mqtt/username.",
      )
    }
  })

  test("Created configuration API will return configuration value from the first provider that does not throw an error.", async () => {
    jest.mocked(staticConfiguration, true)
    jest
      .mocked(staticConfiguration.get)
      .mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi([
      staticConfiguration,
      TestConfigProvder,
      TestConfigProvder2,
    ])

    const actual = await api.get("mqtt/username")
    expect(actual).toEqual("value")
  })

  test("Created configuration API defaults to providers (in order): static, azure key vault providers.", async () => {
    jest.mocked(staticConfiguration, true)
    jest
      .mocked(staticConfiguration.get)
      .mockRejectedValue("Configuration value not found.")
    get.mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi()

    try {
      await api.get("mqtt/username")
    } catch (error) {}

    expect(staticConfiguration.get).toHaveBeenCalledWith("mqtt/username")
    expect(get).toHaveBeenCalledWith("mqtt/username")
  })

  test("Can get the names of all supported configuration by aggregating them from the providers.", async () => {
    getNames.mockReturnValue(["one"])
    const api = await sut.createConfigurationApi([
      TestConfigProvder,
      TestConfigProvder2,
    ])

    const actual = api.getNames()
    expect(actual).toEqual(["azureKeyVaultName", "azure/location", "one"])
  })

  test("Setting a value will use all providers that supports the value.", async () => {
    getNames.mockReturnValue(["azure/location"])
    const api = await sut.createConfigurationApi([
      TestConfigProvder,
      TestConfigProvder2,
    ])

    api.set("azure/location", "test")
    expect(set).toHaveBeenCalledWith("azure/location", "test")
    expect(TestConfigProvder.set).not.toHaveBeenCalled()
    expect(TestConfigProvder2.set).toHaveBeenCalledWith(
      "azure/location",
      "test",
    )
  })
})

const TestConfigProvder: ConfigurationApi<{ azureKeyVaultName: string }> = {
  get: async (name) => "value",
  getNames: () => ["azureKeyVaultName"],
  set: jest.fn(),
}

const TestConfigProvder2: ConfigurationApi<{
  azureKeyVaultName: string
  "azure/location": string
}> = {
  get: async (name) => "different value",
  getNames: () => ["azureKeyVaultName", "azure/location"],
  set: jest.fn(),
}
