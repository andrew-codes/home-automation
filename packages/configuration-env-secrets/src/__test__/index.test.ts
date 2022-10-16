jest.mock("dotenv")
import path from "path"
import { config } from "dotenv"
import { configurationApi } from "../"

describe("configuration api module exports", () => {
  test("Configuration gets values from .secrets.env env variables.", async () => {
    jest
      .mocked(config)
      .mockReturnValue({ parsed: { ONEPASSWORD_TOKEN: "value" } })

    const actual = await configurationApi.get("onepassword/token")
    expect(config).toHaveBeenCalledWith({
      path: path.join(__dirname, "..", "..", "..", "..", ".secrets.env"),
    })
    expect(actual).toEqual("value")
  })

  test("Can get a list of all configuration names", () => {
    const actual = configurationApi.getNames()
    expect(actual).toEqual([
      "onepassword/server-url",
      "onepassword/token",
      "onepassword/vault-id",
      "code-cov/token",
    ])
  })
})
