import express from "express"
import { createLogger } from "@ha/logger"
import spdy from "spdy"

const logger = createLogger()

const run = async () => {
  const app = express()

  app.use("/health", (req, resp) => {
    logger.silly("Health endpoint hit")
    resp.status(200).send("up")
  })

  app.use(
    express.static("/assets", {
      cacheControl: true,
      etag: true,
      maxAge: "30d",
    }),
  )

  spdy.createServer({}, app).listen(80, (error) => {
    if (error) {
      logger.error(error)
      return process.exit(1)
    } else {
      logger.info(`🚀 Server ready on port 80`)
    }
  })
}

if (require.main === module) {
  run()
}
