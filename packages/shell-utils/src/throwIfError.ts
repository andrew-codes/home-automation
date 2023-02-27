import { doIf } from "@ha/env-utils"
import { createLogger } from "@ha/logger"
import { ChildProcess } from "child_process"
import createDebugger from "debug"

const logger = createLogger()
const debug = createDebugger("cli")

const throwIfError = async (
  child:
    | {
        stdout
        stderr
        code: number
      }
    | ChildProcess,
) =>
  new Promise((resolve, reject) => {
    try {
      if (child instanceof ChildProcess) {
        let output = ``
        let error = ``
        child?.stdout?.on("data", function (data) {
          debug(data)
          output += data
        })
        child?.stderr?.on("data", function (data) {
          debug(data)
          error += data
        })
        child.on("close", (exitCode) => {
          doIf(() => exitCode !== 0)(() => {
            logger.info(error)
            reject(new Error(error))
          })
          logger.info(output)
          resolve(output)
        })
      } else {
        doIf(() => child.code !== 0)(() => {
          logger.info(child.stderr.toString())
          reject(new Error(child.stderr.toString()))
        })

        resolve(child.stdout)
      }
    } catch (error) {
      logger.info(error)
      reject(error)
    }
  })

export default throwIfError
