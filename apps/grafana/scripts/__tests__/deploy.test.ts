jest.mock("@ha/jsonnet")
jest.mock("@ha/kubectl")
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import path from "path"
import { jsonnet } from "@ha/jsonnet"
import { kubectl } from "@ha/kubectl"
import { when } from "jest-when"
import run from "../deploy"

describe("deploy", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const configApiGet = jest.fn()

  test("index.jsonnet file is evaluated with GRAFANA configuration values and applied to the cluster.", async () => {
    when(configApiGet)
      .calledWith("grafana/username")
      .mockResolvedValue("username")
    when(configApiGet)
      .calledWith("grafana/password")
      .mockResolvedValue("password")
    when(configApiGet)
      .calledWith("grafana/port/external")
      .mockResolvedValue("8080")
    when(configApiGet)
      .calledWith("grafana/influxdb/token")
      .mockResolvedValue("token")

      when(jsonnet.eval)
      .calledWith(
        path.join(__dirname, "..", "..", "deployment", "index.jsonnet"),
        {
          grafana_username: "username",
          grafana_password: "password",
          grafana_port_external: 8080,
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
      get: configApiGet,
    } as unknown as ConfigurationApi<Configuration>)

    expect(kubectl.applyToCluster).toHaveBeenCalledWith('{"graph":1}')
    expect(kubectl.applyToCluster).toHaveBeenCalledWith('{"graph":2}')
  })

  test('Cluster deployment is rolled out.',async () => {
    when(jsonnet.eval)
    .mockResolvedValue(
      JSON.stringify({
        grafana: {
          graph: { graph: 1 },
          graph2: { graph: 2 },
        },
      }),
    )
    await run({
      get: configApiGet,
    } as unknown as ConfigurationApi<Configuration>)

    expect(kubectl.rolloutDeployment).toHaveBeenCalledWith('restart', 'grafana', {namespace: 'monitoring'})
  });
})
