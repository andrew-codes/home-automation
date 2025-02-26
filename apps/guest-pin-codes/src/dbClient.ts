import { logger } from "@ha/logger"
import { MongoClient } from "mongodb"

let client: MongoClient()

const getClient = async () => {
  logger.info("Getting DB client")
  if (!client) {
    const host = process.env.DB_HOST
    const connectionUrl = `mongodb://${host}`
    client = new MongoClient(connectionUrl)
    logger.info("Connecting a new client")
    await client.connect()
  }

  logger.info("Returning new client")

  return client
}

export default getClient
