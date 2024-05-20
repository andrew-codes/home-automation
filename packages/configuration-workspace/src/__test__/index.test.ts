jest.mock("@ha/configuration-1password")
jest.mock("@ha/configuration-env-secrets")
import { createConfigApi as create1PasswordConfiguration } from "@ha/configuration-1password"
import { configurationApi as envConfiguration } from "@ha/configuration-env-secrets"
import { ConfigurationApi } from "@ha/configuration-api"
import * as sut from ".."

describe("configuration api module exports", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const get = jest.fn()
  const getNames = jest.fn()
  const set = jest.fn()
  beforeEach(() => {
    jest.mocked(create1PasswordConfiguration).mockResolvedValue({
      get,
      getNames,
      set,
    })
  })

  test("Created configuration API will throw error if configuration value cannot be found by name.", async () => {
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
    const api = await sut.createConfigurationApi([
      TestConfigProvder,
      TestConfigProvder2,
    ])

    const actual = await api.get("mqtt/username")
    expect(actual).toEqual("value")
  })

  test("Created configuration API defaults to providers (in order): env, 1Password providers.", async () => {
    jest
      .mocked(envConfiguration.get)
      .mockRejectedValue("Configuration value not found.")
    get.mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi()

    try {
      await api.get("mqtt/username")
    } catch (error) {}

    expect(get).toHaveBeenCalledWith("mqtt/username")
  })

  test("Can get the names of all supported configuration by aggregating them from the providers.", async () => {
    getNames.mockReturnValue(["one"])
    const api = await sut.createConfigurationApi([
      TestConfigProvder,
      TestConfigProvder2,
    ])

    const actual = api.getNames()
    expect(actual).toEqual([
      "onepassword/token",
      "onepassword/server-url",
      "one",
    ])
  })

  test("Setting a value will use all providers that supports the value.", async () => {
    getNames.mockReturnValue(["onepassword/server-url"])
    const api = await sut.createConfigurationApi([
      TestConfigProvder,
      TestConfigProvder2,
    ])

    api.set("onepassword/server-url", "test")
    expect(set).toHaveBeenCalledWith("onepassword/server-url", "test")
    expect(TestConfigProvder.set).not.toHaveBeenCalled()
    expect(TestConfigProvder2.set).toHaveBeenCalledWith(
      "onepassword/server-url",
      "test",
    )
  })
})

const TestConfigProvder: ConfigurationApi<{ "onepassword/token": string }> = {
  get: async (name) => "value",
  getNames: () => ["onepassword/token"],
  set: jest.fn(),
}

const TestConfigProvder2: ConfigurationApi<{
  "onepassword/token": string
  "onepassword/server-url": string
}> = {
  get: async (name) => "different value",
  getNames: () => ["onepassword/token", "onepassword/server-url"],
  set: jest.fn(),
}
