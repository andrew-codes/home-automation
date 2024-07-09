import { createLogger } from "@ha/logger"
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
        logger.debug("Playactor check failed. Device may be offline.")
        throw new Error(stderr)
      }

      const checkedDevice: DiscoveredPlayStation = JSON.parse(stdout)

      const newDevice = {
        id: checkedDevice.id,
        available: true,
        extras: checkedDevice.extras,
      }
      yield put(updatedPlayStation(newDevice))
    } catch (e) {
      logger.debug("Error checking device state. Device may be offline.")
      try {
        const newDevice = {
          id: device.id,
          available: true,
          extras: { status: "UNKNOWN" as "UNKNOWN" },
        }
        yield put(updatedPlayStation(newDevice))
      } catch (error) {
        logger.debug("FATAL error")
        logger.error(error)
      }
    }
  }
}

export { pollStateEffect }
