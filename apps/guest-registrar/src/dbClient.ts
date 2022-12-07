import { MongoClient } from "mongodb"
import { createLogger } from "@ha/logger"

let client: MongoClient
const logger = createLogger()

const getClient = async () => {
  logger.info("Getting DB client")
  if (!client) {
    const username = process.env.DB_USERNAME
    const password = process.env.DB_PASSWORD
    const host = process.env.DB_HOST
    const port = process.env.DB_PORT
    const connectionUrl = `mongodb://${username}:${password}@${host}:${port}`
    client = new MongoClient(connectionUrl)
    logger.info("Connecting a new client")
    await client.connect()
  }

  return client
}

export default getClient
