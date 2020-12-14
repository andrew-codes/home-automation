const debug = require("debug")("@ha/captive-portal/server")
const express = require("express")
const path = require("path")

const { PORT } = process.env

const staticDir = path.join(__dirname, "static")
const thankYouPage = path.join(staticDir, "thank-you.html")
const registerPage = path.join(staticDir, "register.html")

const app = express()

// A weekend (3 days) worth of time per authorization.
app.use(express.static(path.join(__dirname, "static")))
app.get("/", async (req, res) => {
  try {
    const mac = req.query.mac
    if (!mac) {
      throw new Error("No MAC address found in URL")
    }
    res.sendFile(registerPage)
  } catch (e) {
    debug(e)
    res.sendStatus(500)
  }
})

app.use(express.urlencoded({ extended: true }))
app.post("/register", async (req, res) => {
  try {
    const { mac, isPrimaryDevice } = req.body
    if (!mac) {
      throw new Error("No MAC address found in request body")
    }
    debug("mac", mac)
    debug("isPrimaryDevice", isPrimaryDevice)

    res.sendFile(thankYouPage)
  } catch (e) {
    debug(e)
    res.sendStatus(500)
  }
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
