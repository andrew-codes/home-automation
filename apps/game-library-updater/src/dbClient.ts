import { MongoClient } from 'mongodb'

let client: MongoClient

const getClient = async () => {
    if (!client) {
        const username = process.env.DB_USERNAME
        const password = process.env.DB_PASSWORD
        const host = process.env.DB_HOST
        const port = process.env.DB_PORT
        const connectionUrl = `mongodb://${username}:${password}@${host}:${port}`
        client = new MongoClient(connectionUrl);
        await client.connect()
    }

    return client
}

export default getClient