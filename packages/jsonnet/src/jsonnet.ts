import path from "path"
import sh from "shelljs"
import { flow } from "lodash/fp"
import { safeCliString, safeCliStringWitDoubleQuotes } from "@ha/cli-utils"

const jsonnet = {
  eval: async (
    jsonnetContent: string,
    variables: Record<string, string> = {},
  ): Promise<string> => {
    const content = safeCliStringWitDoubleQuotes(jsonnetContent)
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
  variables: Record<string, string> = {},
): string => {
  return Object.entries(variables)
    .map(
      ([key, value]) =>
        `--ext-str "${key}=\\"\$(echo -n "${safeCliString(value)}")\\""`,
    )
    .join(" ")
}

export default jsonnet
