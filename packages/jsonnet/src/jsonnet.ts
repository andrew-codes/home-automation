import path from "path"
import sh from "shelljs"
import { safeCliString, safeCliStringWithDoubleQuotes } from "@ha/cli-utils"
import { createLogger } from "@ha/logger"

const logger = createLogger()

const jsonnet = {
  eval: async (
    jsonnetContent: string,
    variables: Record<string, string | number | string[]> = {},
  ): Promise<string> => {
    const content = safeCliStringWithDoubleQuotes(jsonnetContent)
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
    command += ` "$(echo -n "${content}" | tr '\\n' ' ')";`
    const { stderr, stdout } = sh.exec(command, { silent: true })
    if (!!stderr) {
      console.log(command)
      throw new Error(stderr)
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
      if (typeof value === "number") {
        v = value
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          v = `\$(echo -n ${safeCliString("")})`
        } else {
          v = `\$(echo -n ${safeCliString(JSON.stringify(value.join(",")))})`
        }
      } else {
        v = `\$(echo -n ${safeCliString(JSON.stringify(value))})`
      }
      return `--ext-str "${key}=${v}"`
    })
    .join(" ")
}

export default jsonnet
