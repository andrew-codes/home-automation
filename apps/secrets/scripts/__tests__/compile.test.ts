jest.mock("fs/promises")
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import path from "path"
import fs from "fs/promises"
import { when } from "jest-when"
import run from "../compile"

describe("compile secrets", () => {
  const getNames = jest.fn()
  const get = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test(`Will output a jsonnet file with each secret defined as a k8s env var secret.
    The intention is to be able to import this file and access any secret jsonnet to use with an app k8s deployment (env var from secret).`, async () => {
    getNames.mockReturnValue(["mqtt/username", "home-assistant/client/id"])
    await run({ get, getNames } as unknown as ConfigurationApi<Configuration>)

    const expectedFileContents = `
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet";

{
  "mqtt/username": k.core.v1.envVar.fromSecretRef(\"MQTT_USERNAME\", \"mqtt/username\", 'secret-value'),
  "home-assistant/client/id": k.core.v1.envVar.fromSecretRef(\"HOME_ASSISTANT_CLIENT_ID\", \"home-assistant/client/id\", 'secret-value')
}`

    expect(fs.mkdir).toHaveBeenCalledWith(
      path.join(__dirname, "..", "..", "dist"),
      { recursive: true },
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(__dirname, "..", "..", "dist", "secrets.jsonnet"),
      expectedFileContents,
      "utf8",
    )
  })

  test(`Will output a jsonnet file containing the Azure Key Vault secret definitions.`, async () => {
    when(get).calledWith("azure/key-vault/name").mockResolvedValue("kv-name")
    getNames.mockReturnValue(["mqtt/username", "home-assistant/client/id"])
    await run({ get, getNames } as unknown as ConfigurationApi<Configuration>)

    const expectedFileContents = `
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

{
  "mqtt/username": lib.akvSecrets.new(\"kv-name\", \"mqtt/username\", \"MQTT_USERNAME\"),
  "home-assistant/client/id": lib.akvSecrets.new(\"kv-name\", \"home-assistant/client/id\", \"HOME_ASSISTANT_CLIENT_ID\")
}`

    expect(fs.mkdir).toHaveBeenCalledWith(
      path.join(__dirname, "..", "..", "dist"),
      { recursive: true },
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(__dirname, "..", "..", "dist", "index.jsonnet"),
      expectedFileContents,
      "utf8",
    )
  })
})
