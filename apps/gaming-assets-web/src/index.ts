import express from "express"
import fs from "fs/promises"
import path from "path"
import { createLogger } from "@ha/logger"
import sharp from "sharp"
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

  const cacheFor300Days = 60 * 60 * 24 * 300
  app.use("/resize/:id", async (req, resp) => {
    try {
      const { id } = req.params
      const { width, height } = req.query
      if (!width || !height) {
        throw new Error("Both width and height are required.")
      }
      const resizedImageStream = sharp(path.join("/assets", id)).reszie({
        width,
        height,
      })
      resp.set("Cache-control", `public, max-age=${cacheFor300Days}`)
      resp.pipe(resizedImageStream)
    } catch (error) {
      logger.error(error)
    }
  })

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
