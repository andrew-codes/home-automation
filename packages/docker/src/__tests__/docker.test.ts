jest.mock("shelljs", () => ({
  exec: jest.fn(),
}))
import { ConfigurationApi } from "@ha/configuration-api"
import { Configuration } from "@ha/configuration-workspace"
import sh from "shelljs"
import { when } from "jest-when"
import { createClient } from "../docker"
import path from "path"

describe("docker", () => {
  const get = jest.fn()
  beforeEach(() => {
    jest.mocked(sh.exec).mockReturnValue({ stderr: "", stdout: "", code: 0 })
    when(sh.exec)
      .calledWith(expect.stringContaining("docker login"), { silent: true })
      .mockReturnValue({ stderr: "", stdout: "", code: 0 })
    when(get)
      .calledWith("docker-registry/hostname")
      .mockResolvedValue("registry.com")
    when(get)
      .calledWith("docker-registry/username")
      .mockResolvedValue("username")
    when(get)
      .calledWith("docker-registry/password")
      .mockResolvedValue("password")
  })

  test("Creating a docker client will authenticate the docker CLI to the registry.", async () => {
    await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(sh.exec).toHaveBeenCalledWith(
      `docker login registry.com --username username --password password;`,
      { silent: true },
    )
  })

  test("Failures to authenticate throw an error", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker login"), { silent: true })
      .mockReturnValue({ stderr: "error", stdout: "", code: 1 })
    expect(
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
      { silent: true },
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
      { silent: true },
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
      { silent: true },
    )
  })

  test("Docker build CLI errors throw error.", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker build"), { silent: true })
      .mockReturnValue({ stderr: "error", stdout: "", code: 1 })
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(docker.build("some/imageName:latest")).rejects.toThrow("error")
  })

  test("Pushing an image to a registy proxy to the docker CLI.", async () => {
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    await docker.pushImage("some/imageName:latest")

    expect(sh.exec).toHaveBeenCalledWith(
      `docker push registry.com/some/imageName:latest;`,
      { silent: true },
    )
  })

  test("Docker push CLI errors throw error.", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker push"), { silent: true })
      .mockReturnValue({ stderr: "error", stdout: "", code: 1 })
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(docker.pushImage("some/imageName:latest")).rejects.toThrow("error")
  })
})
