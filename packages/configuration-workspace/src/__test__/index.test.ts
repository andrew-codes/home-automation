import * as sut from ".."

describe("configuration api module exports", () => {
  test("Creates a configuration API capable of getting configuration values.", async () => {
    const api = await sut.createConfigurationApi()
    api.get("external_zwave_js_port")
  })
})
