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
import { Db, GridFSBucket, MongoClient, ObjectId } from "mongodb"
import { flow, map, first } from "lodash/fp"
import { merge } from "lodash"
import type { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper"
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars"

const logger = createLogger()
type GraphContext = {
  // token: string
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
    id: ID!
    name: String!
    games: [Game]!
  }

  type GameGenre @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game]!
  }

  type GameSeries @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game]!
  }

  type GameSource @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game]!
  }

  type Game @key(fields: "id") {
    id: ID!
    added: DateTime!
    communityScore: Int
    coverImage: String
    criticScore: Int
    description: String
    gameId: String!
    genres: [GameGenre]!
    isInstalled: Boolean!
    isInstalling: Boolean!
    isLaunching: Boolean!
    isRunning: Boolean!
    isUninstalling: Boolean!
    name: String!
    platforms: [GamePlatform]!
    recentActivity: DateTime
    releaseDate: Date
    releaseYear: Int
    series: [GameSeries]!
    source: GameSource
  }
`

const toGames = map((dbGame) =>
  merge({}, dbGame, {
    platforms: dbGame.platformIds,
    genres: dbGame.genreIds,
    series: dbGame.seriesIds,
    releaseDate:
      dbGame.releaseDate !== null
        ? Date.parse(dbGame.releaseDate?.releaseDate).toString()
        : null,
  }),
)
const toGame = flow(toGames, first)

const resolvers: GraphQLResolverMap<GraphContext> = {
  ...scalarResolvers,
  Query: {
    genres(parent, args, ctx) {
      return ctx.db.collection("genres").find({}).toArray()
    },
    async games(parent, args, ctx) {
      const games = await ctx.db.collection("games").find({}).toArray()
      return toGames(games)
    },
  },
  Game: {
    async __resolveReference(ref, ctx: GraphContext) {
      const game = await ctx.db.collection("games").findOne({ _id: ref.id })
      return toGame([game])
    },
    async games(parent, args, ctx) {
      const games = await ctx.db
        .collection("games")
        .find({ _id: { $in: parent.gameIds } })
        .toArray()
      return toGames(games)
    },
  },
  GameGenre: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("genres").findOne({ _id: ref.id })
    },
    async genres(parent, args, ctx) {
      logger.info("genres")

      logger.debug(JSON.stringify(parent))
      logger.debug(JSON.stringify(args))
      logger.debug(JSON.stringify(ctx))
      console.log("genres", parent, args, ctx)
      return (
        (await ctx.db
          .collection("genres")
          .find({ _id: { $in: parent.genreIds } })
          .toArray()) ?? []
      )
    },
  },
  GamePlatform: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("platforms").findOne({ _id: ref.id })
    },
    async platforms(parent, args, ctx) {
      return await (ctx.db
        .collection("platforms")
        .find({
          _id: { $in: parent.platformIds },
        })
        .toArray() ?? [])
    },
  },
  GameSeries: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("").findOne({ _id: ref.id })
    },
    async series(parent, args, ctx) {
      return (
        (await ctx.db
          .collection("series")
          .find({
            _id: { $in: parent.seriesIds },
          })
          .toArray()) ?? []
      )
    },
  },
  GameSource: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("sources").findOne({ _id: ref.id })
    },
    source(parent, args, ctx) {
      return ctx.db.collection("sources").findOne({ _id: parent.sourceId })
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

        return { db }
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
