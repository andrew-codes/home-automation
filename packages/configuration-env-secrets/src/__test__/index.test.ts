jest.mock("dotenv")
import path from "path"
import { config } from "dotenv"
import { configurationApi } from "../"

describe("configuration api module exports", () => {
  test("Configuration gets values from .secrets.env env variables.", async () => {
    jest
      .mocked(config)
      .mockReturnValue({ parsed: { AZURE_CLIENT_ID: "client id" } })

    const actual = await configurationApi.get("azure/client/id")
    expect(config).toHaveBeenCalledWith({
      path: path.join(__dirname, "..", "..", "..", "..", ".secrets.env"),
    })
    expect(actual).toEqual("client id")
  })

  test("Can get a list of all configuration names", () => {
    const actual = configurationApi.getNames()
    expect(actual).toEqual([
      "azure/client/id",
      "azure/client/object/id",
      "azure/client/secret",
      "azure/key-vault/name",
      "azure/resource-group",
      "azure/subscription/id",
      "azure/tenant/id",
      "code-cov/token"
    ])
  })
})
