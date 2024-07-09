import { configureStore, StateFromReducersMapObject } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"
import deviceSliceReducer from "./device.slice"
import pollingReducer from "./polling.slice"
import saga from "./saga"

const reducer = {
  device: deviceSliceReducer,
  polling: pollingReducer,
}

const createStore = (preloadedState: RootState) => {
  const sagaMiddleware = createSagaMiddleware()

  const store = configureStore({
    reducer,
    preloadedState,
    middleware: (gDm) => gDm().concat([sagaMiddleware]),
  })

  sagaMiddleware.run(saga)

  return store
}
type RootState = StateFromReducersMapObject<typeof reducer>

export { createStore }
export type { RootState }
