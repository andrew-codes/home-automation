import { createLogger } from "@ha/logger"
import { call } from "redux-saga/effects"
import type { UpdatePortersAction } from "../types"

const logger = createLogger()

function* updatePorters(action: UpdatePortersAction) {
  try {
    logger.info(action.payload)
    const response: Response = yield call(
      fetch,
      `https://portersetup.com/api/locations/${process.env.WIFI_PORTER_LOCATION_ID}`,
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${process.env.WIFI_PORTER_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          plaintext_credential: {
            captive_portal_password: null,
            captive_portal_username: null,
            hidden: false,
            key: action.payload.passPhrase,
            security: "wpa2",
            ssid: action.payload.name,
          },
          account_password: process.env.WIFI_PORTER_ACCOUNT_PASSWORD,
        }),
      },
    )
    logger.info(`Porter update response: ${response.ok} ${response.statusText}`)
  } catch (error) {
    logger.error(error)
  }
}

export default updatePorters
