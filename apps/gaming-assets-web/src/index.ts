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

  app.use("/*:id", cors<cors.CorsRequest>(), async (req, resp) => {
    try {
      const id = req.params.id
      if (!id) {
        resp.status(400)

        return
      }

      const contentType = await getContentType(id)
      if (!contentType) {
        throw new Error("Content type of ID not supported")
      }

      resp.writeHead(200, {
        "Content-Type": contentType,
        "Content-disposition": `attachment;filename=${id}.png`,
      })

      const host = process.env.DB_HOST
      const connectionUrl = `mongodb://${host}`
      const client = new MongoClient(connectionUrl)
      await client.connect()
      const db = client.db("gameLibrary")
      const bucket = new GridFSBucket(db, {
        bucketName: "assets",
      })
      const _id = new ObjectId(id as string)
      const assetExists = (await bucket.find({ _id }).count()) > 0
      if (!assetExists) {
        throw new Error(`Asset ${id} not found.`)
      }

      bucket
        .openDownloadStream(new ObjectId(id as string))
        .pipe(resp)
        .end(() => resp.end())
    } catch (error) {
      logger.error(error)
      resp.status(500)
    }
  })

  app.listen(80, () => logger.info(`🚀 Server ready on port 80`))
}

if (require.main === module) {
  run()
}
