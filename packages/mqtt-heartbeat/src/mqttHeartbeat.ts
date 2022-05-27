import createDebugger from "debug"
import createSagaMiddleware from "@redux-saga/core"
import { applyMiddleware, createStore } from "redux"
import { reducer, registerWithHomeAssistant, saga } from "./redux"

const debug = createDebugger("@ha/mqtt-heartbeat/mqttHeartbeat")

const createMqttHeartbeat = async (serviceName: string): Promise<void> => {
  debug("Started")
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(reducer, applyMiddleware(sagaMiddleware))
  sagaMiddleware.run(saga)
  store.dispatch(registerWithHomeAssistant(serviceName))
}

export default createMqttHeartbeat
