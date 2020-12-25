import { MongoClient } from "mongodb"

const {
  MONGO_INITDB_ROOT_PASSWORD,
  MONGO_INITDB_ROOT_USERNAME,
  MONGODB_HOST,
  MONGODB_PORT,
} = process.env

const dbUri = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`
const client = new MongoClient(dbUri)
client.connect()

export { client }
