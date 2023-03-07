import { ApolloServer, BaseContext } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
// import { unwrapResolverError } from "@apollo/server/errors"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { first, uniq } from "lodash"
import express from "express"
import spdy from "spdy"
import http from "http"
import cors from "cors"
import bodyParser from "body-parser"
import gql from "graphql-tag"
import { buildSubgraphSchema } from "@apollo/subgraph"
import { createLogger } from "@ha/logger"
import type { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper"
import { resolvers as scalarResolvers } from "graphql-scalars"
import { Db, GridFSBucket, MongoClient, ObjectId } from "mongodb"
import { get } from "lodash/fp"
import type { Loaders } from "./loaders"
import createLoader from "./loaders"
import schema from "./schema"
import { graphql, GraphQLError } from "graphql"
import type { AsyncMqttClient } from "async-mqtt"
import { createMqtt } from "@ha/mqtt-client"

const logger = createLogger()

type GraphContext = {
  // token: string
  db: Db
  loaders: Loaders
  mqtt: AsyncMqttClient
} & BaseContext

const typeDefs = gql`
  ${schema}
`

const resolvers: GraphQLResolverMap<GraphContext> = {
  ...scalarResolvers,
  Query: {
    async areas(parent, args, ctx) {
      const ids =
        ((await ctx.db
          .collection("gameAreas")
          .find({})
          .map(get("id"))
          .toArray()) as string[]) ?? ([] as string[])

      return ctx.loaders.gameAreas.loadMany(ids)
    },
    async completionStates(parent, args, ctx) {
      const ids = await ctx.db
        .collection("completionStatus")
        .find({})
        .map(get("id"))
        .toArray()

      return ctx.loaders.completionStatus.loadMany((ids ?? []) as string[])
    },
    async genres(parent, args, ctx) {
      const ids =
        ((await ctx.db
          .collection("genres")
          .find({})
          .map(get("id"))
          .toArray()) as string[]) ?? ([] as string[])

      return ctx.loaders.genres.loadMany(ids)
    },
    async platforms(parent, args, ctx) {
      const ids =
        ((await ctx.db
          .collection("platforms")
          .find({})
          .map(get("id"))
          .toArray()) as string[]) ?? ([] as string[])

      return ctx.loaders.platforms.loadMany(ids)
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
    async gameReleaseById(parent, args, ctx) {
      const gameRelease = await ctx.db
        .collection("gameReleases")
        .findOne({ _id: args.id })
      if (!gameRelease) {
        throw new GraphQLError(`Game release not found for ID: ${args.id}`)
      }

      return ctx.loaders.gameReleases.load(gameRelease.id)
    },
  },
  Mutation: {
    async startGame(parent, args, ctx) {
      const gameReleaseResult = await ctx.db
        .collection("gameReleases")
        .findOne({ _id: args.gameReleaseId })

      if (!gameReleaseResult) {
        throw new GraphQLError(
          `Game release not found for ID: ${args.gameReleaseId}`,
        )
      }

      const gameRelease = await ctx.loaders.gameReleases.load(
        gameReleaseResult.id,
      )
      const platform = await ctx.loaders.platforms.load(gameRelease.platformId)

      await ctx.mqtt.publish(
        `homeassistant/${args.areaId}/game_media_player/start`,
        JSON.stringify({
          id: gameRelease.gameId,
          platformName: platform.name,
        }),
      )

      return gameRelease
    },
    async stopGame(parent, args, ctx) {
      const gameReleaseResult = await ctx.db
        .collection("gameReleases")
        .findOne({ _id: args.gameReleaseId })

      if (!gameReleaseResult) {
        throw new GraphQLError(
          `Game release not found for ID: ${args.gameReleaseId}`,
        )
      }

      const gameRelease = await ctx.loaders.gameReleases.load(
        gameReleaseResult.id,
      )
      const platform = await ctx.loaders.platforms.load(gameRelease.platformId)

      await ctx.mqtt.publish(
        `homeassistant/${args.areaId}/game_media_player/stop`,
        JSON.stringify({
          id: gameRelease.gameId,
          platformName: platform.name,
        }),
      )

      return gameRelease
    },
  },
  GameCompletionState: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.loaders.completionStatus.load(ref.id)
    },
    releases: async (parent, args, ctx) => {
      return ctx.loaders.games.load(parent.gameIds)
    },
  },
  GameRelease: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.loaders.gameReleases.load(ref.id)
    },
    activities: async (parent, args, ctx) => {
      const activityIds = await ctx.db
        .collection("gameActivities")
        .find({ gameId: parent.id })
        .map((activtity) => activtity.id)
        .toArray()

      return ctx.loaders.gameActivities.loadMany(activityIds)
    },
    game(parent, args, ctx) {
      return ctx.loaders.games.load(parent.gameId)
    },
    platform(parent, args, ctx) {
      return ctx.loaders.platforms.load(parent.platformId)
    },
    source(parent, args, ctx) {
      return ctx.db.collection("source").findOne({ _id: parent.sourceId })
    },
    completionState(parent, args, ctx) {
      return ctx.loaders.completionStatus.load(parent.completionStatusId)
    },
  },
  Game: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.loaders.games.load(ref.id)
    },
    async releases(parent, args, ctx) {
      return ctx.loaders.gameReleases.loadMany(parent.platformReleaseIds)
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
    async releases(parent, args, ctx) {
      const platforms = await ctx.db
        .collection("platforms")
        .find({ id: parent.id })
        .toArray()
      const platform = first(platforms)

      const releaseIds = (await ctx.db
        .collection("gameReleases")
        .find({
          id: {
            $regex: `${parent.id}_${platform.gameIds
              .map((id) => `(${id})`)
              .join("|")}`,
          },
        })
        .map(get("id"))
        .toArray()) as string[]

      return ctx.loaders.gameReleases.loadMany(uniq(releaseIds))
    },
    async areas(parent, args, ctx) {
      const ids = await ctx.db
        .collection("gameAreasPlatforms")
        .find({ platformId: parent.id })
        .map((area) => area.areaId)
        .toArray()

      return ctx.loaders.gameAreas.loadMany(ids)
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
    games(parent, args, ctx) {
      return ctx.loaders.games.loadMany(parent.gameIds)
    },
  },
  GameArea: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("gameAreas").findOne({ _id: ref.id })
    },
    async activity(parent, args, ctx) {
      const activity = await ctx.loaders.gameActivities.load(parent.id)
      if (activity instanceof Error) {
        return null
      }

      return activity
    },
    platforms: async (parent, args, ctx) => {
      const ids = await ctx.db
        .collection("gameAreasPlatforms")
        .find({ areaId: parent.id })
        .map((area) => area.platformId)
        .toArray()

      return ctx.loaders.platforms.loadMany(ids)
    },
  },
  GameActivity: {
    __resolveReference(ref, ctx: GraphContext) {
      return ctx.db.collection("gameActivities").findOne({ _id: ref.id })
    },
    area: async (parent, args, ctx) => {
      return ctx.loaders.gameAreas.load(parent.id)
    },
    release: (parent, args, ctx) => {
      return ctx.loaders.gameReleases.load(parent.releaseId)
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
        try {
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

          const mqtt = await createMqtt()

          return { db, loaders, mqtt }
        } catch (error) {
          throw new GraphQLError(error?.toString() ?? "Unknown")
        }
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

  const port = process.env.PORT ?? "80"
  const spdyServer = spdy.createServer(
    {
      spdy: {
        plain: true,
        ssl: false,
        protocols: ["h2", "spdy/3.1", "http/1.1"],
      },
    },
    app,
  )
  spdyServer.listen(port, (error) => {
    if (error) {
      logger.error(error)
      return process.exit(1)
    } else {
      logger.info(`🚀 Server ready on port 80`)
    }
  })
}

if (require.main === module) {
  run()
}
