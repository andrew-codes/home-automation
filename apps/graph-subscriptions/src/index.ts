import { ApolloServer, BaseContext } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { IResolvers } from "@graphql-tools/utils"
import { schema } from "@ha/graph-subscriptions-schema"
import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import type { AsyncMqttClient } from "async-mqtt"
import bodyParser from "body-parser"
import cors from "cors"
import express from "express"
import { GraphQLError } from "graphql"
import { PubSub } from "graphql-subscriptions"
import gql from "graphql-tag"
import { useServer } from "graphql-ws/lib/use/ws"
import http from "http"
import { WebSocketServer } from "ws"

const logger = createLogger()

type GraphContext = {
  // token: string
  mqtt: AsyncMqttClient
} & BaseContext

const typeDefs = gql`
  ${schema}
`

const run = async () => {
  const pubsub = new PubSub()
  const mqtt = await createMqtt()

  const resolvers: IResolvers<any, GraphContext> = {
    Query: {
      health: async () => "up",
    },
    Subscription: {
      activityChanged: {
        subscribe: async () => pubsub.asyncIterator(["activityChanged"]),
      },
    },
  }

  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  })

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer<GraphContext>({
    introspection: true,
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
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

          return { mqtt }
        } catch (error) {
          throw new GraphQLError(error?.toString() ?? "Unknown")
        }
      },
    }),
  )

  const port = process.env.PORT ?? "80"
  httpServer.listen(port, () => {
    logger.info(`🚀 Server ready on port 80`)
  })

  const gameStateExpression = /^playnite\/(.+)\/game_media_player\/state$/
  mqtt.subscribe("playnite/+/game_media_player/state")
  mqtt.on("message", async (topic, payload) => {
    try {
      const parsedPayload = JSON.parse(payload.toString())
      const matches = gameStateExpression.exec(topic)
      if (matches !== null && matches.length > 0) {
        const areaId = matches[0]
        pubsub.publish("activityChanged", {
          id: areaId,
          releaseId: parsedPayload.releaseId,
        })
      }
    } catch (e) {
      logger.error(e)
    }
  })
}

if (require.main === module) {
  run()
}
