jest.mock("@ha/configuration-static")
import { staticConfiguration } from "@ha/configuration-static"
import * as sut from ".."

describe("configuration api module exports", () => {
  test("Created configuration API will throw error if configuration value cannot be found by name.", async () => {
    jest.mocked(staticConfiguration, true)
    staticConfiguration.get.mockRejectedValue("Configuration value not found.")
    const api = await sut.createConfigurationApi()
    try {
      const value = await api.get("azureKeyVaultName")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toEqual(
        "Configuration value not found, azureKeyVaultName.",
      )
    }
  })
})
