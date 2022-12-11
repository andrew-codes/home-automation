import { createLogger } from "@ha/logger"
import { call, put, select } from "redux-saga/effects"
import { Discovery } from "playactor/dist/discovery"
import { toLower, merge } from "lodash"
import type { Device, DiscoverDevicesAction } from "../types"
import { registerDeviceWithHomeAssistant } from "../actionCreators"
import { getDevices } from "../selectors"

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
  logger.info("Discovering devices")
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
  logger.info("Discovered devices")
  logger.debug(JSON.stringify(devices, null, 2))
  const knownDevices: Device[] = yield select(getDevices)
  for (const device of devices) {
    if (!!knownDevices.find((knownDevice) => knownDevice.id === device.id)) {
      logger.info(`Device already known to HA: ${device.name}`)

      return
    }

    logger.info(`Registering device, ${device.name} with HA`)
    logger.debug(JSON.stringify(device, null, 2))
    yield put(
      registerDeviceWithHomeAssistant(
        merge({}, device, {
          available: true,
          normalizedName: device.name
            .replace(/[^a-zA-Z\d\s-_:]/g, "")
            .replace(/[\s-]/g, "_")
            .toLowerCase(),
        }),
      ),
    )
  }
}

export { discoverDevices }
