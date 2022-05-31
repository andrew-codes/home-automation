import { flow } from "lodash/fp"

const safeCliStringWitDoubleQuotes = (input: string | number): string => {
  if (typeof input === "string") {
    input.replace(/"/g, '\\"')
  }

  return input.toString()
}
const safeCliStringWithNewLines = (input: string): string => {
  return input.replace(/\n/g, "\\n")
}
const safeCliString = flow([
  safeCliStringWitDoubleQuotes,
  safeCliStringWithNewLines,
])

export { safeCliString, safeCliStringWitDoubleQuotes as safeCliStringWithDoubleQuotes }
