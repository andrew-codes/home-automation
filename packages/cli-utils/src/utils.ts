import { flow } from "lodash/fp"

const safeCliStringWithDoubleQuotes = (input: string | number): string => {
  if (typeof input === "string") {
    input.replace(/"/g, '\\"')
  }

  return input.toString()
}
const safeCliStringWithSingleQuotes = (input: string | number): string => {
  if (typeof input === "string") {
    input.replace(/'/g, "\\'")
  }

  return input.toString()
}
const safeCliStringWithNewLines = (input: string): string => {
  return input.replace(/\n/g, "\\n")
}
const safeCliString = flow([
  safeCliStringWithDoubleQuotes,
  safeCliStringWithSingleQuotes,
  safeCliStringWithNewLines,
])

export { safeCliString, safeCliStringWithDoubleQuotes }
