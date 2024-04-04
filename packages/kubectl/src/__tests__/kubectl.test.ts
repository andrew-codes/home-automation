jest.mock("shelljs", () => ({
  exec: jest.fn(),
}))
jest.mock("fs/promises")
jest.mock("uuid")
import fs from "fs/promises"
import path from "path"
import sh from "shelljs"
import { v4 as uuidv4 } from "uuid"
import kubectl from "../kubectl"

describe("kubectl", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    jest.mocked(sh.exec).mockReturnValue({ stderr: "", stdout: "", code: 0 })
  })

  describe("applyToCluster", () => {
    test(`Applies content to k8s cluster via kubectl CLI.
- a temporary file is used for the content to be applied to avoid a shell command that is too long.`, async () => {
      ;(uuidv4 as jest.Mock).mockReturnValue("fileName")

      const input = `{
        "person"
      }`
      await kubectl.applyToCluster(input)

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join("/tmp", "fileName"),
        input,
      )
      expect(sh.exec).toHaveBeenCalledWith(
        expect.stringMatching(/kubectl apply -f \/tmp\/fileName;/),
        { silent: false, shell: "/bin/bash" },
      )
    })
  })

  describe("rolloutDeployment", () => {
    test("Invokes kubectl rollout with proper CLI parameters.", () => {
      kubectl.rolloutDeployment("restart", "deployment.name")
      expect(sh.exec).toHaveBeenCalledWith(
        `kubectl -n default rollout restart deployment deployment.name;`,
        { silent: true },
      )
    })

    test("Deployments can be in a non-default namespace.", () => {
      kubectl.rolloutDeployment("restart", "deployment.name", {
        namespace: "ns",
      })
      expect(sh.exec).toHaveBeenCalledWith(
        `kubectl -n ns rollout restart deployment deployment.name;`,
        { silent: true },
      )
    })
  })
})
