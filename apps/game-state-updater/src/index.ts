import createDebugger from "debug"
import { connectAsync } from "async-mqtt"
import { lowerCase } from "lodash"
import { MongoClient } from "mongodb"

const debug = createDebugger("@ha/game-state-updater-app/index")

const {
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_PASSWORD,
  MONGODB_USERNAME,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
} = process.env

const dbUri = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`
const mongo = new MongoClient(dbUri)

const run = async () => {
  debug("Starting app.")
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  await mqtt.subscribe("/playnite/game/starting")
  await mqtt.subscribe("/playnite/game/started")
  await mqtt.subscribe("/playnite/game/started/ps4")
  await mqtt.subscribe("/playnite/game/started/ps5")
  await mqtt.subscribe("/playnite/game/stopped")
  await mqtt.subscribe("/playnite/game/installed")
  await mqtt.subscribe("/playnite/game/uninstalled")

  await mongo.connect()

  const db = await mongo.db("gameLibrary")
  await db.collection("gameDetails").updateMany(
    { $or: [{ isStarted: true }, { isStarting: true }] },
    {
      $set: {
        isStarted: false,
        isStarting: false,
      },
    }
  )

  mqtt.on("message", async (topic, message) => {
    debug("topic", topic)
    console.log(topic)
    try {
      if (topic === "/playnite/game/starting") {
        const gameId = message.toString()
        debug(gameId)
        const db = await mongo.db("gameLibrary")
        await db.collection("gameDetails").updateOne(
          {
            playniteId: gameId,
          },
          {
            $set: {
              isStarting: true,
              isStarted: false,
              isInstalled: true,
              isUninstalled: false,
            },
          }
        )
        mqtt.publish("/playnite/game/state/updated", gameId.toString())
      }
      if (topic === "/playnite/game/started") {
        const gameId = message.toString()
        const db = await mongo.db("gameLibrary")
        await db.collection("gameDetails").updateOne(
          {
            playniteId: gameId,
          },
          {
            $set: {
              isStarting: false,
              isStarted: true,
              isInstalled: true,
              isUninstalled: false,
            },
          }
        )
        mqtt.publish("/playnite/game/state/updated", gameId.toString())
      }
      if (topic === "/playnite/game/stopped") {
        const db = await mongo.db("gameLibrary")
        await db.collection("gameDetails").updateMany(
          { $or: [{ isStarted: true }, { isStarting: true }] },
          {
            $set: {
              isStarting: false,
              isStarted: false,
            },
          }
        )
        mqtt.publish("/playnite/game/state/updated", "")
      }
      if (topic === "/playnite/game/installed") {
        const gameId = message.toString()
        const db = await mongo.db("gameLibrary")
        await db.collection("gameDetails").updateOne({
          filter: {
            playniteId: gameId,
          },
          update: {
            $set: {
              isStarting: false,
              isStarted: false,
              isInstalled: true,
              isUninstalled: false,
            },
          },
        })
        mqtt.publish("/playnite/game/state/updated", gameId.toString())
      }
      if (topic === "/playnite/game/uninstalled") {
        const gameId = message.toString()
        const db = await mongo.db("gameLibrary")
        await db.collection("gameDetails").updateOne(
          {
            id: gameId,
          },
          {
            $set: {
              isStarting: false,
              isStarted: false,
              isInstalled: false,
              isUninstalled: true,
            },
          }
        )
        mqtt.publish("/playnite/game/state/updated", gameId.toString())
      }
      if (topic === "/playnite/game/started/ps4") {
        const gameName = message.toString()
        const db = await mongo.db("gameLibrary")
        const matchingGames = await db
          .collection("gameDetails")
          .find(
            { "platform.name": "Sony PlayStation 4" },
            { name: 1, playniteId: 1 }
          )
          .toArray()
        const matchingGame = matchingGames.find(({ name }) =>
          lowerCase(name).includes(lowerCase(gameName))
        )
        if (!matchingGame || gameName === "") {
          debug("No matching PS game", gameName)
          await db.collection("gameDetails").updateOne(
            { id: "unknown" },
            {
              $set: {
                isStarting: false,
                isStarted: true,
                isInstalled: true,
                isUninstalled: false,
              },
            }
          )
          return
        }
        await db.collection("gameDetails").updateOne(
          { "platform.name": "Sony PlayStation 4", name: gameName },
          {
            $set: {
              isStarting: false,
              isStarted: true,
              isInstalled: true,
              isUninstalled: false,
            },
          }
        )
        mqtt.publish("/playnite/game/state/updated", matchingGame.playniteId)
      }
      if (topic === "/playnite/game/started/ps5") {
        const gameName = message.toString()
        const db = await mongo.db("gameLibrary")
        const matchingGames = await db
          .collection("gameDetails")
          .find(
            { "platform.name": "Sony PlayStation 5" },
            { name: 1, playniteId: 1 }
          )
          .toArray()
        const matchingGame = matchingGames.find(({ name }) =>
          lowerCase(name).includes(lowerCase(gameName))
        )
        if (!matchingGame || gameName === "") {
          debug("No matching PS game", gameName)
          await db.collection("gameDetails").updateOne(
            { id: "unknown" },
            {
              $set: {
                isStarting: false,
                isStarted: true,
                isInstalled: true,
                isUninstalled: false,
              },
            }
          )
          return
        }
        await db.collection("gameDetails").updateOne(
          { "platform.name": "Sony PlayStation 5", name: gameName },
          {
            $set: {
              isStarting: false,
              isStarted: true,
              isInstalled: true,
              isUninstalled: false,
            },
          }
        )
        mqtt.publish("/playnite/game/state/updated", matchingGame.playniteId)
      }
    } catch (error) {
      debug(error)
    }
  })
}
run()

process.on("exit", async () => {
  await mongo.close()
})
