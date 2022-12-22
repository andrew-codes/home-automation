import express from "express"
import cors from "cors"
import { createLogger } from "@ha/logger"
import { GridFSBucket, MongoClient, ObjectId } from "mongodb"
import getContentType from "./contentType"

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

  app.listen(80, () => logger.info(`🚀 Server ready on port 80`))
}

if (require.main === module) {
  run()
}
