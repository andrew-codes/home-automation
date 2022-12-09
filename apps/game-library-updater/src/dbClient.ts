import { MongoClient } from "mongodb"

let client: MongoClient

const getClient = async () => {
  if (!client) {
    const username = process.env.GAME_LIBRARY_DB_USERNAME
    const password = process.env.GAME_LIBRARY_DB_PASSWORD
    const host = process.env.GAME_LIBRARY_DB_HOST
    const port = process.env.GAME_LIBRARY_DB_PORT
    const connectionUrl = `mongodb://${username}:${password}@${host}:${port}`
    client = new MongoClient(connectionUrl)
    await client.connect()
  }

  return client
}

export default getClient
