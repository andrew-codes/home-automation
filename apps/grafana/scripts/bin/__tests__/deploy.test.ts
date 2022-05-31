import run from "../"

describe("deploy", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const jsonnetEval = jest.fn()
  beforeEach(() => {
    // jest.mocked(Jsonnet).mockImplementation(() => ({ eval: jsonnetEval }))
  })

  test("index.jsonnet file is evaluated with GRAFANA configuration values.", () => {})
})
