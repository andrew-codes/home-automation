import createDebug from "debug"
import express from "express"
const debug = createDebug("@ha/games-player/index")

const app = express()
app.get("*", async (req, resp) => {
  resp.sendFile("index.html")
})
