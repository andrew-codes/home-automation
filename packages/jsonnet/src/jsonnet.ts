import path from "path"
import sh from "shelljs"
import { safeCliString, safeCliStringWithDoubleQuotes } from "@ha/cli-utils"

const jsonnet = {
  eval: async (
    jsonnetContent: string,
    variables: Record<string, string | number> = {},
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
    command += ` $(echo -n "${content}" | tr '\\n' ' ')`

    const { stderr, stdout } = sh.exec(command)
    if (!!stderr) {
      throw new Error(stderr)
    }

    return stdout
  },
}

const variablesToCLIString = (
  variables: Record<string, string | number> = {},
): string => {
  return Object.entries(variables)
    .map(([key, value]) => {
      let v
      if (typeof value === "number") {
        v = value
      } else {
        v = `\\"\$(echo -n ${safeCliString(JSON.stringify(value))})\\"`
      }
      return `--ext-str "${key}=${v}"`
    })
    .join(" ")
}

export default jsonnet
