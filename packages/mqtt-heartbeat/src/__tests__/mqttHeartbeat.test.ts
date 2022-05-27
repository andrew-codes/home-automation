jest.mock("redux")
jest.mock("@redux-saga/core")
jest.mock("../redux", () => ({
  ...jest.requireActual("../redux"),
  saga: jest.fn(),
}))
import { applyMiddleware, Store } from "redux"
import { createStore } from "redux"
import type { SagaMiddleware } from "redux-saga"
import createSagaMiddleware from "@redux-saga/core"
import { reducer, saga } from "../redux"
import createMqttHeartbeat from "../mqttHeartbeat"

describe("mqttHeartbeat", () => {
  let dispatch = jest.fn()
  const sagaRun = jest.fn()
  let sagaMiddleware

  beforeEach(() => {
    jest.resetAllMocks()
    sagaMiddleware = { run: sagaRun }
    jest.mocked(createStore).mockReturnValue({ dispatch } as unknown as Store)
    jest
      .mocked(createSagaMiddleware)
      .mockReturnValue(sagaMiddleware as unknown as SagaMiddleware)
  })

  test("saga middleware is created, added to redux and run", async () => {
    await createMqttHeartbeat("service_name")
    expect(createStore).toHaveBeenCalledWith(
      reducer,
      applyMiddleware(sagaMiddleware),
    )

    expect(sagaRun).toBeCalledWith(saga)
  })

  test("creating a mqtt heartbeat will dispatch to register the service with Home Assistant", async () => {
    await createMqttHeartbeat("service_name")

    expect(dispatch).toHaveBeenCalledWith({
      type: "HEARTBEAT/REGISTER_DEVICE",
      payload: "service_name",
    })
  })
})
