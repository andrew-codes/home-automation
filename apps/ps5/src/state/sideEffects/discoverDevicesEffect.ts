import { createLogger } from "@ha/logger"
import { Discovery } from "playactor/dist/discovery"
import { call, put } from "redux-saga/effects"
import { DiscoveredPlayStation, playStationDiscovered } from "../device.slice"
import registerWithHomeAssistantEffect from "./registerWithHomeAssistantEffect"

const logger = createLogger()

const useAsyncIterableWithSaga =
  (fn, ...args) =>
  () =>
    new Promise(async (resolve, reject) => {
      const iterable = fn(...args)
      const outputs: any[] = []
      try {
        for await (const iterableAction of await iterable) {
          if (!!iterableAction) {
            outputs.push(iterableAction)
          }
        }
        resolve(outputs)
      } catch (error) {
        reject(error)
      }
    })

function* discoverDevicesEffect() {
  logger.info("Discovering devices")
  const discovery = new Discovery()
  const devices: Array<DiscoveredPlayStation> = yield call(
    useAsyncIterableWithSaga(
      discovery.discover.bind(discovery),
      {},
      {
        timeoutMillis: 3000,
      },
    ),
  )

  for (const device of devices) {
    logger.info("Discovered device")
    logger.debug(JSON.stringify(device, null, 2))

    const action = playStationDiscovered(device)
    yield put(action)
    yield call(registerWithHomeAssistantEffect, action)
  }
}

export { discoverDevicesEffect }
