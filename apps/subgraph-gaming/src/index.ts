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
import type { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper"
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars"
import { Db, GridFSBucket, MongoClient, ObjectId } from "mongodb"
import { get } from "lodash/fp"
import type { Loaders } from "./loaders"
import createLoader from "./loaders"

const logger = createLogger()
type GraphContext = {
  // token: string
  db: Db
  loaders: Loaders
} & BaseContext

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  ${scalarTypeDefs.join(`

  `)}
  type Query {
    games: [Game!]!
    genres: [GameGenre!]!
    platforms: [GamePlatform!]!
  }

  type GamePlatform @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type GameGenre @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type GameSeries @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type GameSource @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type Game @key(fields: "id") {
    id: ID!
    added: DateTime!
    backgroundImage: String
    communityScore: Int
    coverImage: String
    criticScore: Int
    description: String
    gameId: String!
    genres: [GameGenre!]!
    isInstalled: Boolean!
    isInstalling: Boolean!
    isLaunching: Boolean!
    isRunning: Boolean!
    isUninstalling: Boolean!
    name: String!
    platforms: [GamePlatform!]
    recentActivity: DateTime
    releaseDate: Date
    releaseYear: Int
    series: [GameSeries!]!
    source: GameSource
  }
`

const resolvers: GraphQLResolverMap<GraphContext> = {
  ...scalarResolvers,
  Query: {
    async genres(parent, args, ctx) {
      const ids =
        ((await ctx.db
          .collection("genres")
          .find({})
          .map(get("id"))
          .toArray()) as string[]) ?? ([] as string[])

      return ctx.loaders.games.loadMany(ids)
    },
    async games(parent, args, ctx) {
      const ids =
        ((await ctx.db
          .collection("games")
          .find({})
          .map(get("id"))
          .toArray()) as string[]) ?? ([] as string[])

      return ctx.loaders.games.loadMany(ids)
    },
  },
  Game: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.loaders.games.load(ref.id)
    },
    platforms(parent, args, ctx) {
      return ctx.loaders.platforms.loadMany(parent.platformIds)
    },
    genres(parent, args, ctx) {
      return ctx.loaders.genres.loadMany(parent.genreIds)
    },
    series(parent, args, ctx) {
      return ctx.loaders.series.loadMany(parent.seriesIds)
    },
  },
  GameGenre: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("genres").findOne({ _id: ref.id })
    },
    games(parent, args, ctx) {
      return ctx.loaders.games.loadMany(parent.gameIds)
    },
  },
  GamePlatform: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("platforms").findOne({ _id: ref.id })
    },
    games(parent, args, ctx) {
      return ctx.loaders.games.loadMany(parent.gameIds)
    },
  },
  GameSeries: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("").findOne({ _id: ref.id })
    },
    games(parent, args, ctx) {
      return ctx.loaders.games.loadMany(parent.gameIds)
    },
  },
  GameSource: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("sources").findOne({ _id: ref.id })
    },
    source(parent, args, ctx) {
      return ctx.db.collection("sources").findOne({ _id: parent.sourceId })
    },
    games(parent, args, ctx) {
      return ctx.loaders.games.loadMany(parent.gameIds)
    },
  },
}

const run = async () => {
  const app = express()
  const httpServer = http.createServer(app)

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

  app.use("/health", (req, resp) => {
    logger.silly("Health endpoint hit")
    resp.status(200).send("up")
  })

  app.use(
    "/",
    cors<cors.CorsRequest>(),
    bodyParser.json({ limit: "50mb" }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // const token = first(req.headers.authorization)
        // if (!token) {
        //   throw new GraphQLError("User is not authenticated", {
        //     extensions: {
        //       code: "UNAUTHENTICATED",
        //       http: { status: 401 },
        //     },
        //   })
        // }
        const host = process.env.DB_HOST
        const connectionUrl = `mongodb://${host}`
        const client = new MongoClient(connectionUrl)
        await client.connect()
        const db = client.db("gameLibrary")
        const loaders = await createLoader(db)

        return { db, loaders }
      },
    }),
  )

  app.use("/cover", async (req, resp) => {
    const id = req.query.id
    if (!id || Array.isArray(id)) {
      resp.status(400)

      return
    }

    try {
      const host = process.env.DB_HOST
      const connectionUrl = `mongodb://${host}`
      const client = new MongoClient(connectionUrl)
      await client.connect()
      const db = client.db("gameLibrary")
      const bucket = new GridFSBucket(db, {
        bucketName: "covers",
      })
      resp.writeHead(200, {
        "Content-Type": "image/png",
        "Content-disposition": `attachment;filename=${id}.png`,
      })
      bucket
        .openDownloadStream(new ObjectId(id as string))
        .pipe(resp)
        .end()
    } catch (error) {
      resp.status(500)
    }
  })

  await new Promise<void>((resolve) => httpServer.listen({ port: 80 }, resolve))
  logger.info(`🚀 Server ready on port 80`)
}

if (require.main === module) {
  run()
}
