import run from "../initialize-secrets"

describe("initialize-secrets", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("Will set all secrets that do not already have a value to a default value of 'change me'", async () => {
    const configurationApi = {
      getNames: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    }
    configurationApi.getNames.mockReturnValue(["one", "two", "three"])
    configurationApi.get.mockResolvedValueOnce("I have a value")
    configurationApi.get.mockResolvedValue(null)

    await run(configurationApi)
    expect(configurationApi.set).not.toHaveBeenCalledWith("one", "change me")
    expect(configurationApi.set).toHaveBeenCalledWith("two", "change me")
    expect(configurationApi.set).toHaveBeenCalledWith("three", "change me")
  })
})
