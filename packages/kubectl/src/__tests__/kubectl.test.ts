jest.mock("shelljs", () => ({
  exec: jest.fn(),
}))
import sh from "shelljs"
import kubectl from "../kubectl"

describe("kubectl", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    jest.mocked(sh.exec).mockReturnValue({ stderr: "", stdout: "" })
  })

  describe("applyToCluster", () => {
    test("Applies content to k8s cluster via kubectl CLI.", () => {
      const input = `{
        "person"
      }`
      kubectl.applyToCluster(input)
      expect(sh.exec).toHaveBeenCalledWith(
        `echo -n "{\\n        \\"person\\"\\n      }" | kubectl apply -f -`,
      )
    })
  })

  describe("rolloutDeployment", () => {
    test("Invokes kubectl rollout with proper CLI parameters.", () => {

      kubectl.rolloutDeployment('restart', 'deployment.name')
      expect(sh.exec).toHaveBeenCalledWith(
        `kubectl -n default rollout restart deployment deployment.name`,
      )
    })

    test("Deployments can be in a non-default namespace.", () => {

      kubectl.rolloutDeployment('restart', 'deployment.name',{namespace: 'ns'})
      expect(sh.exec).toHaveBeenCalledWith(
        `kubectl -n ns rollout restart deployment deployment.name`,
      )
    })
  })
})
