import { createLogger } from "@ha/logger"
import { merge } from "lodash"
import { put, select } from "redux-saga/effects"
import sh from "shelljs"
import {
  DiscoveredPlayStation,
  getKnownPlayStations,
  PlayStation,
  updatedPlayStation,
} from "../device.slice"

const logger = createLogger()

function* pollStateEffect() {
  logger.info("Poll device state.")
  const devices: PlayStation[] = yield select(getKnownPlayStations)
  for (const device of devices) {
    try {
      logger.info(`Checking device state for device ${device.name}`)
      const { stdout, stderr, code } = sh.exec(
        `playactor check --host-name ${device.name} --machine-friendly --no-open-urls --no-auth;`,
      )
      if (stderr || code !== 0) {
        throw new Error(stderr)
      }

      const checkedDevice: DiscoveredPlayStation = JSON.parse(stdout)

      const newDevice = merge({}, checkedDevice, {
        available: true,
      })
      yield put(updatedPlayStation(newDevice))
    } catch (e) {
      logger.debug("Error checking device state. Device may be offline.")
      logger.error(e)
      yield put(
        updatedPlayStation(
          merge({}, device, {
            extras: {
              status: "UNKNOWN",
            },
            available: false,
          }),
        ),
      )
    }
  }
}

export { pollStateEffect }
