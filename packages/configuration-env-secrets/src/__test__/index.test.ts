jest.mock("dotenv")
import path from "path"
import { config } from "dotenv"
import { configurationApi } from "../"

describe("configuration api module exports", () => {
  test("Configuration gets values from .secrets.env env variables.", async () => {
    jest.mocked(config).mockReturnValue({ parsed: { pmPass: "pm pass value" } })

    const actual = await configurationApi.get("pmPass")
    expect(config).toHaveBeenCalledWith({
      path: path.join(__dirname, "..", "..", "..", "..", ".secrets.env"),
    })
    expect(actual).toEqual("pm pass value")
  })
})
