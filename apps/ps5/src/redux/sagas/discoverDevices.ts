import { call, put } from "redux-saga/effects"
import { Discovery } from "playactor/dist/discovery"
import { toEntityId } from "@ha/ha-entity-utils"
import { merge } from "lodash"
import type { DiscoverDevicesAction } from "../types"
import { registerDeviceWithHomeAssistant } from "../actionCreators"

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
  for (const device of devices) {
    yield put(
      registerDeviceWithHomeAssistant(
        merge({}, device, { homeAssistantId: toEntityId(device.name) }),
      ),
    )
  }
}

export { discoverDevices }
