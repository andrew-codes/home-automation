import { createLogger } from "@ha/logger"
import sh from "shelljs"
import { PlayStation } from "../device.slice"

const logger = createLogger()

function* turnOnEffect(ps: PlayStation) {
  logger.info(`Turning on PlayStation (${ps.id})`)
  const { stdout, stderr, code } = sh.exec(
    `playactor wake --ip ${ps.address.ip} --timeout 5000 --connect-timeout 5000 --no-open-urls --no-auth;`,
    { timeout: 5000 },
  )
  logger.info(stdout.toString())
  if (code !== 0) {
    logger.debug(stderr.toString(), code)
  }
}

export { turnOnEffect }
