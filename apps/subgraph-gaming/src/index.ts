import { ApolloServer, BaseContext } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
// import { unwrapResolverError } from "@apollo/server/errors"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import express from "express"
import http from "http"
import cors from "cors"
import bodyParser from "body-parser"
import gql from "graphql-tag"
import { buildSubgraphSchema } from "@apollo/subgraph"
import { createLogger } from "@ha/logger"
import { createHeartbeat } from "@ha/http-heartbeat"
import { Db, MongoClient, ObjectId } from "mongodb"
import { first } from "lodash"
import { GraphQLError } from "graphql"
import type { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper"
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars"
import { altairExpress } from "altair-express-middleware"

const logger = createLogger()
type GraphContext = {
  token: string
  db: Db
} & BaseContext

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  ${scalarTypeDefs.join(`

  `)}
  type Query {
    games: [Game!]!
    genres: [GameGenre!]!
  }

  type GamePlatform @key(fields: "id") {
    id ID!
    name String!
    games [Game!]!
  }

  type GameGenres @key(fields: "id") {
    id ID!
    name String!
  }

  type GameSeries @key(fields: "id") {
    id ID!
    name String!
    games [Game!]!
  }

  type GameSource @key(fields: "id") {
    id ID!
    name String!
    games [Game!]!
  }

  type Game @key(fields: "id") {
    id ID!
    added: DateTime!
    communityScore Int
    criticScore Int
    description String
    gameId String!
    genres [GameGenre!]!
    isInstalled Boolean!
    isInstalling Boolean!
    isLaunching Boolean!
    isRunning Boolean!
    isUninstalling Boolean!
    name String!
    platforms [GamePlatforms!]!
    recentActivity DateTime
    releaseDate Date
    releaseYear Int
    series [GameSeries!]!
    source GameSource!
  }
`

const resolvers: GraphQLResolverMap<GraphContext> = {
  ...scalarResolvers,
  Query: {
    genres(parent, args, ctx) {
      return ctx.db.collection("genres").find({})
    },
    games(parent, args, ctx) {
      return ctx.db.collection("games").find({})
    },
  },
  Game: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("games").find({ _id: new ObjectId(ref.id) })
    },
    games(parent, args, ctx) {
      return ctx.db
        .collection("games")
        .find({ _id: { $in: parent.gameIds.map((id) => new ObjectId(id)) } })
    },
  },
  GameGenre: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("genres").find({ _id: new ObjectId(ref.id) })
    },
    genres(parent, args, ctx) {
      return ctx.db
        .collection("genres")
        .find({ _id: { $in: parent.genreIds.map((id) => new ObjectId(id)) } })
    },
  },
  GamePlatform: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("platforms").find({ _id: new ObjectId(ref.id) })
    },
    genres(parent, args, ctx) {
      return ctx.db.collection("platforms").find({
        _id: { $in: parent.platformIds.map((id) => new ObjectId(id)) },
      })
    },
  },
  GameSeries: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("series").find({ _id: new ObjectId(ref.id) })
    },
    genres(parent, args, ctx) {
      return ctx.db
        .collection("series")
        .find({ _id: { $in: parent.seriesIds.map((id) => new ObjectId(id)) } })
    },
  },
  GameSource: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("sources").find({ _id: new ObjectId(ref.id) })
    },
    genres(parent, args, ctx) {
      return ctx.db
        .collection("platforms")
        .find({ _id: new ObjectId(parent.sourceId) })
    },
  },
}

const run = async () => {
  const app = express()
  const httpServer = await createHeartbeat("/health", http.createServer(app))

  const server = new ApolloServer<GraphContext>({
    schema: buildSubgraphSchema({
      typeDefs: typeDefs,
      resolvers: resolvers as GraphQLResolverMap<any>,
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError, error) => {
      logger.error(formattedError.message, formattedError)

      return formattedError
    },
  })
  await server.start()
  app.use(
    "/",
    cors<cors.CorsRequest>(),
    bodyParser.json({ limit: "50mb" }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = first(req.headers.authorization)
        if (!token) {
          throw new GraphQLError("User is not authenticated", {
            extensions: {
              code: "UNAUTHENTICATED",
              http: { status: 401 },
            },
          })
        }
        const host = process.env.DB_HOST
        const connectionUrl = `mongodb://${host}`
        const client = new MongoClient(connectionUrl)
        await client.connect()
        const db = client.db("gameLibrary")

        return { db, token }
      },
    }),
  )
  app.use(
    "/altair",
    altairExpress({
      endpointURL: "/",
      subscriptionsEndpoint: `ws://localhost:80/subscriptions`,
      initialQuery: `{ games { id name } }`,
    }),
  )

  await new Promise<void>((resolve) => httpServer.listen({ port: 80 }, resolve))
  logger.info(`🚀 Server ready on port 80`)
}

if (require.main === module) {
  run()
}