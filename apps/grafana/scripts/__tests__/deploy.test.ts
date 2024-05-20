jest.mock("@ha/jsonnet")
jest.mock("@ha/kubectl")
jest.mock("fs/promises")
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { when } from "jest-when"
import path from "path"
import run from "../deploy"

describe("deploy", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const get = jest.fn()

  beforeEach(() => {
    when(get)
      .calledWith("grafana/username")
      .mockResolvedValue({ value: "username" })
    when(get)
      .calledWith("grafana/password")
      .mockResolvedValue({ value: "password" })
    when(get)
      .calledWith("grafana/port/external")
      .mockResolvedValue({ value: "8080" })
    when(get)
      .calledWith("grafana/influxdb/token")
      .mockResolvedValue({ value: "token" })
  })

  test("index.jsonnet file is evaluated with GRAFANA configuration values and applied to the cluster.", async () => {
    when(jsonnet.eval)
      .calledWith(
        path.join(__dirname, "..", "..", "deployment", "index.jsonnet"),
        {
          grafana_username: "username",
          grafana_password: "password",
          port: "8080",
          grafana_influxdb_token: "token",
        },
      )
      .mockResolvedValue(
        JSON.stringify({
          grafana: {
            graph: { graph: 1 },
            graph2: { graph: 2 },
          },
        }),
      )
    await run({
      get: get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(kubectl.applyToCluster).toHaveBeenCalledWith('{"graph":1}')
    expect(kubectl.applyToCluster).toHaveBeenCalledWith('{"graph":2}')
  })

  test("Cluster deployment is rolled out.", async () => {
    when(jsonnet.eval).mockResolvedValue(
      JSON.stringify({
        grafana: {
          graph: { graph: 1 },
          graph2: { graph: 2 },
        },
      }),
    )
    await run({
      get: get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(kubectl.rolloutDeployment).toHaveBeenCalledWith("restart", "grafana")
  })
})
