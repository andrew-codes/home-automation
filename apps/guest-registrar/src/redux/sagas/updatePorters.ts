import { createLogger } from "@ha/logger"
import { call } from "redux-saga/effects"
import type { UpdatePortersAction } from "../types"

const logger = createLogger()

function* updatePorters(action: UpdatePortersAction) {
  try {
    logger.info("Updating Porters", action.payload)
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
            ssid: action.payload.name,
            key: action.payload.passPhrase,
          },
          account_password: process.env.WIFI_PORTER_ACCOUNT_PASSWORD,
        }),
      },
    )
    logger.info(`Porter update response: ${response.ok} ${response.statusText}`)
    const responseBody = yield call(response.json)
    logger.debug(JSON.stringify(responseBody))
  } catch (error) {
    logger.error(error)
  }
}

export default updatePorters
