import { flow } from "lodash/fp"

const safeCliStringWitDoubleQuotes = (input: string): string =>
  input.replace(/"/g, '\\"')
const safeCliStringWithNewLines = (input: string): string => {
  return input.replace(/\n/g, "\\n")
}
const safeCliString = flow([
  safeCliStringWitDoubleQuotes,
  safeCliStringWithNewLines,
])

export { safeCliString, safeCliStringWitDoubleQuotes }
