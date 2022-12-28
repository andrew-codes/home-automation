import express from "express"
import path from "path"
import { createLogger } from "@ha/logger"
import sharp from "sharp"
import spdy from "spdy"
import compression from "compression"

const logger = createLogger()

const run = async () => {
  const mountRootPath = path.join(process.env.TELEPRESENCE_ROOT ?? "/")
  const assetPath = path.join(mountRootPath, "assets")

  const app = express()

  app.use(compression())

  app.use("/health", (req, resp) => {
    logger.silly("Health endpoint hit")
    resp.status(200).send("up")
  })

  app.use(
    "/assets",
    express.static(assetPath, {
      fallthrough: true,
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
      logger.info(
        `Resize request received: ${id} ${width} ${height}: ${path.join(
          assetPath,
          id,
        )} `,
      )
      const resizedImageStream = sharp(path.join(assetPath, id))
        .resize({
          width: parseInt(width as string),
          fit: "inside",
        })
        .toFormat("png")
      resp.set("Cache-control", `public, max-age=${cacheFor300Days}`)
      resizedImageStream.pipe(resp.type("png"))
    } catch (error) {
      logger.error(error)
      resp.status(400)
    }
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
      return process.exit(1)
    } else {
      logger.info(`🚀 Server ready on port 80`)
    }
  })
}

if (require.main === module) {
  run()
}
