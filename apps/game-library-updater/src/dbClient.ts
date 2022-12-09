import { MongoClient } from "mongodb"

let client: MongoClient

const getClient = async () => {
  if (!client) {
    const host = process.env.DB_HOST
    const connectionUrl = `mongodb://${host}`
    client = new MongoClient(connectionUrl)
    await client.connect()
  }

  return client
}

export default getClient
