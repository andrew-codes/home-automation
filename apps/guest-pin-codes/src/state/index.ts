import { configureStore, StateFromReducersMapObject } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"
import sagas from "../sagas"
import assignedEventReducer from "./assignedEvent.slice"
import eventReducer from "./event.slice"
import lockReducer from "./lock.slice"
import pinCodeReducer from "./pinCode.slice"
import wifiReducer from "./wifi.slice"

const reducer = {
  event: eventReducer,
  pinCode: pinCodeReducer,
  lock: lockReducer,
  assignedEvent: assignedEventReducer,
  wifi: wifiReducer,
}

const create = (preloadedState: RootState) => {
  const sagaMiddleware = createSagaMiddleware()
  const store = configureStore({
    reducer,
    middleware: (gDm) => gDm().concat(sagaMiddleware),
    preloadedState,
  })
  sagaMiddleware.run(sagas)

  return store
}

export default create
export type RootState = StateFromReducersMapObject<typeof reducer>
