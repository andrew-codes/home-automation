import type { RequestListener, Server } from "http"
import createDebugger from "debug"
import { defaultTo } from "lodash"

const debug = createDebugger("@ha/http-heartbeat/heartbeat")

interface HttpServer {}

const createHeartbeat = async (
  path: string,
  server?: Server,
): Promise<Server> => {
  debug("Started")
  const healthPath = defaultTo(path, "/health")
  const urlMatchExpression = new RegExp(`.*${healthPath.replace(/\//, "\\/")}$`)
  const handler: RequestListener = (req, resp) => {
    if (urlMatchExpression.test(req.url ?? "")) {
      debug("Heartbeat endpoint matched")
      resp.statusCode = 200
      resp.end(JSON.stringify({ state: "up" }))
    }
  }
  if (!server) {
    const http = await import("http")
    const healthServer = http.createServer(handler)
    healthServer.listen(80, () => {
      debug("heart beat on port 80")
    })
    return healthServer
  }

  server.addListener("request", handler)
  return server
}

export default createHeartbeat
export type { HttpServer }
