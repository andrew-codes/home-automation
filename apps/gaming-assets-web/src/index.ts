import express from "express"
import path from "path"
import fs from "fs"
import { createLogger } from "@ha/logger"
import sharp from "sharp"
import spdy from "spdy"
import compression from "compression"

const logger = createLogger()

const run = async () => {
  const mountRootPath = path.join(process.env.TELEPRESENCE_ROOT ?? "/")
  const assetsPath = path.join(mountRootPath, "assets")

  const app = express()
  app.enable("etag")
  app.use(compression())

  app.use("/health", (req, resp) => {
    logger.silly("Health endpoint hit")
    resp.status(200).send("up")
  })

  app.use(
    "/assets",
    express.static(assetsPath, {
      fallthrough: true,
      cacheControl: true,
      etag: true,
      maxAge: "300d",
    }),
  )

  const perfTimerPrecision = 3
  const cacheFor300Days = 60 * 60 * 24 * 300
  app.use("/resize/:id", async (req, resp) => {
    const start = process.hrtime()
    const { id } = req.params
    const { height, width } = req.query
    try {
      if (!id && (!width || !height)) {
        throw new Error(
          `Not all parameters supplied: ${id}, width: ${width}, height: ${height}`,
        )
      }
      const assetPath = path.join(assetsPath, id)
      logger.info(
        `Resize request received: ${id} ${width}, ${height}: ${assetPath}`,
      )
      if (!fs.existsSync(assetPath)) {
        resp.status(404).send("Not found")
      }

      let resizeOptions: any = {
        fit: "inside",
      }
      if (width) {
        resizeOptions.width = parseInt(width as string)
      }
      if (height) {
        resizeOptions.height = parseInt(height as string)
      }

      const resizedImageStream = sharp(assetPath).resize(resizeOptions).webp()
      logger.debug(`Resized image ${id}`)
      resp
        .set("Cache-control", `public, max-age=${cacheFor300Days}`)
        .set("ETag", `"${id}@${width}_webp"`)
      resizedImageStream.pipe(resp.type("image/webp"))
    } catch (error) {
      logger.debug(`Failure for ${id} @ ${width}x${height}`)
      logger.error(error)
      resp.status(500)
    }
    const elapsed = process.hrtime(start)[1] / 1000000
    logger.info(
      `${id} time to resize: ${elapsed.toFixed(perfTimerPrecision)}ms`,
    )
  })

  const server = spdy.createServer(
    {
      spdy: {
        ssl: false,
        plain: true,
        protocols: ["h2", "spdy/3.1"],
      },
    },
    app,
  )
  server.listen(process.env.PORT ?? "80", (error) => {
    if (error) {
      logger.error(error)
    } else {
      logger.info(`🚀 Server ready on port 80`)
    }
  })
}

if (require.main === module) {
  run()
}
