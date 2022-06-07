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
    jest.mocked(sh.exec).mockReturnValue({ stderr: "", stdout: "" })
    when(sh.exec)
      .calledWith(expect.stringContaining("docker login"))
      .mockReturnValue({ stderr: "", stdout: "" })
    when(get)
      .calledWith("docker/registry/hostname")
      .mockResolvedValue("registry.com")
    when(get).calledWith("azure/client/id").mockResolvedValue("username")
    when(get).calledWith("azure/client/secret").mockResolvedValue("password")
  })

  test("Creating a docker client will authenticate the docker CLI to the registry.", async () => {
    await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(sh.exec).toHaveBeenCalledWith(
      `docker login registry.com --username username --password password`,
    )
  })

  test("Failures to authenticate throw an error", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker login"))
      .mockReturnValue({ stderr: "error", stdout: "" })
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
      `docker build -t some/imageName:latest ${process.cwd()} -f Dockerfile`,
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
      `docker build -t some/imageName:latest ${path.join(
        __dirname,
      )} -f Dockerfile`,
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
      `docker build -t some/imageName:latest ${process.cwd()} -f aFile`,
    )
  })

  test("Docker build CLI errors throw error.", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker build"))
      .mockReturnValue({ stderr: "error", stdout: "" })
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
      `docker push registry.com/some/imageName:latest`,
    )
  })

  test("Docker push CLI errors throw error.", async () => {
    when(sh.exec)
      .calledWith(expect.stringContaining("docker push"))
      .mockReturnValue({ stderr: "error", stdout: "" })
    const docker = await createClient({
      get,
    } as unknown as ConfigurationApi<Configuration>)

    expect(docker.pushImage("some/imageName:latest")).rejects.toThrow("error")
  })
})
