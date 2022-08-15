import { createLogger } from "@ha/logger"
import { call, put } from "redux-saga/effects"
import { Discovery } from "playactor/dist/discovery"
import { toLower, merge } from "lodash"
import type { DiscoverDevicesAction } from "../types"
import { registerDeviceWithHomeAssistant } from "../actionCreators"

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

function* discoverDevices(action: DiscoverDevicesAction) {
  const discovery = new Discovery()
  const devices = yield call(
    useAsyncIterableWithSaga(
      discovery.discover.bind(discovery),
      {},
      {
        timeoutMillis: 3000,
      },
    ),
  )
  logger.debug('Discovered devices', devices)
  for (const device of devices) {
    logger.info('Registering device with HA', device)
    yield put(
      registerDeviceWithHomeAssistant(
        merge({}, device, {
          available: true,
          normalizedName:
            device.name.replace(/[^a-zA-Z\d\s-_:]/g, '')
              .replace(/[\s-]/g, '_')
              .toLowerCase()
        }),
      ),
    )
  }
}

export { discoverDevices }
