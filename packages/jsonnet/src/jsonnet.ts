import { safeCliStringWithDoubleQuotes } from "@ha/cli-utils"
import { logger } from "@ha/logger"
import path from "path"
import sh from "shelljs"

const jsonnet = {
  eval: async (
    jsonnetPath: string,
    variables: Record<string, string | number | string[]> = {},
  ): Promise<string> => {
    const content = safeCliStringWithDoubleQuotes(jsonnetPath)
    const variablesContent = variablesToCLIString(variables)
    let command = `jsonnet -J ${path.join(
      __dirname,
      "..",
      "..",
      "..",
      "vendor",
    )}`
    if (!!variablesContent) {
      command += ` ${variablesContent}`
    }
    command += ` ${content};`
    const { stderr, stdout, code } = sh.exec(command, { silent: true })
    if (code > 0) {
      logger.error(stderr)
      throw new Error("Failed")
    }

    return stdout
  },
}

const variablesToCLIString = (
  variables: Record<string, string | number | string[]> = {},
): string => {
  return Object.entries(variables)
    .map(([key, value]) => {
      if (!value) {
        logger.error(`Value for ${key} has no value.`)

        return
      }
      let v
      if (typeof value === "number" || typeof value === "string") {
        v = value
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          v = ``
        } else {
          v = `${value.join(",")}`
        }
      } else {
        v = JSON.stringify(value)
      }
      return `--ext-str '${key}=${v}'`
    })
    .join(" ")
}

export default jsonnet
