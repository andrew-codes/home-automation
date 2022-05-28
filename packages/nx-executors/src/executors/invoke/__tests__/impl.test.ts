jest.mock("esbuild-register/dist/node")
jest.mock("@ha/configuration-api")
import executor from "../impl"
import { ExecutorContext } from "@nrwl/devkit"
import { register } from "esbuild-register/dist/node"
import { createConfigurationApi } from "@ha/configuration-workspace"
import type { ConfigurationApi } from "@ha/configuration-api"

let ctx: ExecutorContext
beforeEach(() => {
  jest.resetModules()
})

beforeEach(() => {
  ctx = {
    cwd: "../",
    isVerbose: false,
    root: "./",
    workspace: { version: 2, projects: {} },
  }
})

test("Can require TS modules via esbuild-register.", async () => {
  await executor({ module: "scripts/deploy.ts" }, ctx)
  expect(register).toHaveBeenCalled()
})

test("Non-existant moodule files fail.", async () => {
  const { success } = await executor({ module: "scripts/deploy.ts" }, ctx)
  expect(success).toEqual(false)
})

test("Modules that do not export a function fail.", async () => {
  jest.doMock("deploy", () => ({}))
  const { success } = await executor({ module: "deploy" }, ctx)
  expect(success).toEqual(false)
})

test("Modules default exported function will be invoked with the configuration API.", async () => {
  const deploy = jest.fn()
  jest.doMock("deploy", () => deploy)
  jest
    .mocked(createConfigurationApi)
    .mockResolvedValue({ configuration: true } as unknown as ConfigurationApi)

  const { success } = await executor({ module: "deploy" }, ctx)
  expect(deploy).toBeCalledWith({ configuration: true })
  expect(success).toEqual(true)
})
