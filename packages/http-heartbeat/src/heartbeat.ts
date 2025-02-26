import { logger } from "@ha/logger"
import type { RequestListener, Server } from "http"
import { defaultTo } from "lodash"

interface HttpServer {}

const createHeartbeat = async (
  path?: string,
  server?: Server,
  port?: number,
): Promise<Server> => {
  logger.info("Heartbeat started")
  const healthPath = defaultTo(path, "/health")
  const urlMatchExpression = new RegExp(`.*${healthPath.replace(/\//, "\\/")}$`)
  const handler: RequestListener = (req, resp) => {
    if (urlMatchExpression.test(req.url ?? "")) {
      logger.silly("HTTP Heartbeat endpoint matched")
      resp.statusCode = 200
      resp.end(JSON.stringify({ state: "up" }))
    }
  }
  if (!server) {
    const http = await import("http")
    const healthServer = http.createServer(handler)
    healthServer.listen(port ?? 80, () => {
      logger.info("Heart beat available on port 80")
    })
    return healthServer
  }

  server.addListener("request", handler)

  return server
}

export default createHeartbeat
export type { HttpServer }
