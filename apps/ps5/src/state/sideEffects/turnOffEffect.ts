import { createLogger } from "@ha/logger"
import { delay } from "redux-saga/effects"
import sh from "shelljs"
import { PlayStation } from "../device.slice"

const logger = createLogger()

function* turnOffEffect(ps: PlayStation) {
  logger.info(`Turning off PlayStation (${ps.id})`)
  let shouldContinue = true
  const maxAttempts = 5
  let attempts = 0
  while (shouldContinue) {
    const { stdout, stderr, code } = sh.exec(
      `playactor standby --ip ${ps.address.ip} --timeout 5000 --connect-timeout 5000 --no-open-urls --no-auth;`,
      { timeout: 5000 },
    )
    logger.info(stdout.toString())
    if (code !== 0) {
      logger.error(stderr.toString(), code)
    }
    attempts++
    shouldContinue = code !== 0 && attempts < maxAttempts
    yield delay(1500)
  }
}

export { turnOffEffect }
