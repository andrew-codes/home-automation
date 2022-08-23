import logger from "redux-logger";
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga'
import reducer from './reducer'
import rootSaga from "./saga"
import { AllActions } from './types'


const makeStore = () => {
    const sagaMiddleware = createSagaMiddleware()

    const store = configureStore<any, AllActions, [SagaMiddleware, typeof logger]>({
        reducer, middleware: [sagaMiddleware, logger],
    })
    sagaMiddleware.run(rootSaga)

    return store
}
const store = makeStore()

export default store