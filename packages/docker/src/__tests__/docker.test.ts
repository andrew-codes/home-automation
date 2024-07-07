jest.mock("shelljs", () => ({
  exec: jest.fn(),
}))
import { ConfigurationApi } from "@ha/configuration-api"
import { Configuration } from "@ha/configuration-workspace"
import { when } from "jest-when"
import path from "path"
import sh from "shelljs"
import { createClient } from "../docker"

describe("docker", () => {
  const get = jest.fn()
  beforeEach(() => {
    jest.mocked(sh.exec).mockReturnValue({ stderr: "", stdout: "", code: 0 })
    when(sh.exec)
      .calledWith(expect.stringContaining("docker login"), { silent: true })
      .mockReturnValue({ stderr: "", stdout: "", code: 0 })
    when(get)
      .calledWith("docker-registry/hostname")
      .mockResolvedValue({ value: "registry.com" })
    when(get)
      .calledWith("docker-registry/username")
      .mockResolvedValue({ value: "username" })
    when(get)
      .calledWith("docker-registry/password")
      .mockResolvedValue({ value: "password" })
  })

  test("Creating a docker client will authenticate the docker CLI to the registry.", async () => {
    await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(sh.exec).toHaveBeenCalledWith(
      `docker login registry.com --username username --password password`,
      { silent: true },
    )
  })

  test("Failures to authenticate throw an error", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker login"), { silent: true })
      .mockReturnValue({ stderr: "error", stdout: "", code: 1 })
    await expect(
      createClient({
        get,
      } as unknown as ConfigurationApi<Configuration>),
    ).rejects.toThrow("error")
  })

  test("Building a docker image proxies to the docker CLI.", async () => {
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    await docker.build("some/imageName:latest")

    expect(sh.exec).toHaveBeenCalledWith(
      `docker build -t registry.com/some/imageName:latest ${process.cwd()} -f Dockerfile;`,
      { silent: false },
    )
  })

  test("Building a docker image with custom context.", async () => {
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    await docker.build("some/imageName:latest", {
      context: path.join(__dirname),
    })

    expect(sh.exec).toHaveBeenCalledWith(
      `docker build -t registry.com/some/imageName:latest ${path.join(
        __dirname,
      )} -f Dockerfile;`,
      { silent: false },
    )
  })

  test("Building a docker image with custom dockerfile.", async () => {
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    await docker.build("some/imageName:latest", {
      dockerFile: "aFile",
    })

    expect(sh.exec).toHaveBeenCalledWith(
      `docker build -t registry.com/some/imageName:latest ${process.cwd()} -f aFile;`,
      { silent: false },
    )
  })

  test("Docker build CLI errors throw error.", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker build"), expect.anything())
      .mockReturnValue({ stderr: "error", stdout: "", code: 1 })
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    await expect(docker.build("some/imageName:latest")).rejects.toThrow("error")
  })

  test("Pushing an image to a registy proxy to the docker CLI.", async () => {
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    await docker.pushImage("some/imageName:latest")

    expect(sh.exec).toHaveBeenCalledWith(
      `docker push registry.com/some/imageName:latest;`,
      { silent: false },
    )
  })

  test("Docker push CLI errors throw error.", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker push"), expect.anything())
      .mockReturnValue({ stderr: "error", stdout: "", code: 1 })
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    await expect(docker.pushImage("some/imageName:latest")).rejects.toThrow(
      "error",
    )
  })
})
