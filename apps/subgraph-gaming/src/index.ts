import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import express from "express"
import http from "http"
import cors from "cors"
import bodyParser from "body-parser"
import gql from "graphql-tag"
import { buildSubgraphSchema } from "@apollo/subgraph"
import { createLogger } from "@ha/logger"
import { createHeartbeat } from "@ha/http-heartbeat"

const logger = createLogger()

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String
  }
`

const resolvers = {
  Query: {
    me() {
      return { id: "1", username: "@ava" }
    },
  },
  User: {
    __resolveReference(user, ctx) {
      return user
    },
  },
}

const run = async () => {
  const app = express()
  const httpServer = await createHeartbeat("/health", http.createServer(app))

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })
  await server.start()
  app.use(
    "/",
    cors<cors.CorsRequest>(),
    bodyParser.json({ limit: "50mb" }),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  )

  await new Promise<void>((resolve) => httpServer.listen({ port: 80 }, resolve))
  logger.info(`🚀 Server ready on port 80`)
}

if (require.main === module) {
  run()
}
