import createDebugger from "debug"

const debug = createDebugger("@ha/graphql-api/api-performance-counter")

let apisCount = {}

const countApiCall = (name: string) => {
  if (!apisCount[name]) {
    apisCount[name] = 1
  }
  apisCount[name] += 1
}

const resetCounts = () => {
  debug(apisCount)
  apisCount = {}
}

export { countApiCall, resetCounts }
