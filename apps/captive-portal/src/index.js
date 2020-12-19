const debug = require("debug")("@ha/captive-portal/server")
const express = require("express")
const path = require("path")
const { createApolloFetch } = require("apollo-fetch")

const { GRAPHQL_API_HOST, GRAPHQL_API_TOKEN, PORT } = process.env

const gql = createApolloFetch({
  uri: `http://${GRAPHQL_API_HOST}`,
})
gql.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}
  }
  options.headers["Authorization"] = `Bearer ${GRAPHQL_API_TOKEN}`

  next()
})

const staticDir = path.join(__dirname, "static")
const thankYouPage = path.join(staticDir, "thank-you.html")
const registerPage = path.join(staticDir, "register.html")

const app = express()

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
    await gql({
      query: `mutation trackGuestDevice($mac: String, $isPrimary: Boolean) {
        trackGuestDevice(mac: $mac, isPrimary: $isPrimary) {
          id
        }
      }`,
      variables: {
        mac,
        isPrimary: isPrimaryDevice,
      },
    })
    res.sendFile(thankYouPage)
  } catch (e) {
    debug(e)
    res.sendStatus(500)
  }
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
