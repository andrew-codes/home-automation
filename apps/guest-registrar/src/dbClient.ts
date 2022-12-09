import { MongoClient } from "mongodb"
import { createLogger } from "@ha/logger"

let client: MongoClient
const logger = createLogger()

const getClient = async () => {
  logger.info("Getting DB client")
  if (!client) {
    const host = process.env.DB_HOST
    const connectionUrl = `mongodb://${host}`
    client = new MongoClient(connectionUrl)
    logger.info("Connecting a new client")
    await client.connect()
  }

  return client
}

export default getClient
