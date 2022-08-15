import { doIf } from "@ha/env-utils"
import { createLogger } from "@ha/logger"

const logger = createLogger()

const throwIfError = ({ stdout, stderr, code }) => {
  logger.info('Shell stdout', stdout)
  doIf(() => code !== 0)(() => {
    logger.error('Shell error', stderr, code)
    throw new Error(stderr)
  })

  return stdout
}

export { throwIfError }
