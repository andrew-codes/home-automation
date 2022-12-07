import { doIf } from "@ha/env-utils"
import { createLogger } from "@ha/logger"

const logger = createLogger()

const throwIfError = ({ stdout, stderr, code }) => {
  logger.info("Shell stdout")
  logger.info(stdout)
  doIf(() => code !== 0)(() => {
    logger.info("Shell error")
    logger.error(stderr)
    throw new Error(stderr)
  })

  return stdout
}

export { throwIfError }
