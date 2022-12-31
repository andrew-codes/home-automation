import { createContext, useContext } from "react"

const graphHostContext = createContext<string | null>(null)

const getHost = () => {
  if (typeof document === "undefined") {
    const host = process.env.GRAPH_HOST ?? null
    if (!host) {
      throw Error("No Graph HOST provided")
    }

    return `${host}/graphql`
  }

  const host = useContext(graphHostContext)
  if (!host) {
    throw Error("No Graph HOST provided")
  }

  return host
}

export default getHost
export const Provider = graphHostContext.Provider
