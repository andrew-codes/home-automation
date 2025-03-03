import { doIf } from "@ha/env-utils"
import { ChildProcess } from "child_process"

const throwIfError = async (
  child:
    | {
        stdout
        stderr
        code: number
      }
    | ChildProcess,
): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      if (child instanceof ChildProcess) {
        let output = ``
        let error = ``
        child?.stdout?.on("data", function (data) {
          output += data
        })
        child?.stderr?.on("data", function (data) {
          error += data
        })
        child.on("close", (exitCode) => {
          doIf(() => exitCode !== 0)(() => {
            reject(new Error(error))
          })
          resolve(output.toString())
        })
      } else {
        doIf(() => child.code !== 0)(() => {
          reject(new Error(child.stderr.toString()))
        })

        resolve(child.stdout.toString())
      }
    } catch (error) {
      reject((error as Error).toString())
    }
  })

export default throwIfError
