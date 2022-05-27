import * as Alexa from "ask-sdk-core"
import express from "express"
import createDebug from "debug"
import { createApolloFetch } from "apollo-fetch"
import { ExpressAdapter } from "ask-sdk-express-adapter"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"

const debug = createDebug("@ha/alexa-shopping-list-updater-skill/index")

const run = async () => {
  await createMqttHeartbeat("alexa-shopping-list-updater-service")

  const { API_URL, API_TOKEN, PORT } = process.env
  const gqlFetch = createApolloFetch({
    uri: `http://${API_URL}/`,
  })
  gqlFetch.use(({ request, options }, next) => {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers["Authorization"] = `Bearer ${API_TOKEN}`

    next()
  })

  const MessageReceived = {
    canHandle(handlerInput) {
      return (
        handlerInput.requestEnvelope.request.type ===
        "Messaging.MessageReceived"
      )
    },
    async handle(handlerInput) {
      try {
        debug("Requesting shopping lists...")
        const { apiAccessToken } = handlerInput.requestEnvelope.context.System
        const listsResponse = await fetch(
          "https://api.amazonalexa.com/v2/householdlists/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiAccessToken}`,
            },
          },
        )
        const { lists } = await listsResponse.json()
        debug("list details", lists)

        const listsWithItems = await Promise.all(
          lists.map(async ({ listId }) => {
            const listResponse = await fetch(
              `https://api.amazonalexa.com/v2/householdlists/${listId}/active`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${apiAccessToken}`,
                },
              },
            )
            const listWithItems = await listResponse.json()
            return listWithItems
          }),
        )
        debug("lists with items", JSON.stringify(listsWithItems, null, 4))
      } catch (error) {
        debug("error", error)
      } finally {
        return handlerInput.responseBuilder.getResponse()
      }
    },
  }

  const LaunchRequestHandler = {
    canHandle(handlerInput) {
      return (
        Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
      )
    },
    handle(handlerInput) {
      const speakOutput =
        "Welcome, you can say Hello or Help. Which would you like to try?"
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse()
    },
  }
  const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
      return (
        Alexa.getRequestType(handlerInput.requestEnvelope) ===
          "IntentRequest" &&
        Alexa.getIntentName(handlerInput.requestEnvelope) === "HelloWorldIntent"
      )
    },
    handle(handlerInput) {
      const speakOutput = "Hello World!"
      return (
        handlerInput.responseBuilder
          .speak(speakOutput)
          //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
          .getResponse()
      )
    },
  }
  const HelpIntentHandler = {
    canHandle(handlerInput) {
      return (
        Alexa.getRequestType(handlerInput.requestEnvelope) ===
          "IntentRequest" &&
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.HelpIntent"
      )
    },
    handle(handlerInput) {
      const speakOutput = "You can say hello to me! How can I help?"

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse()
    },
  }
  const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
      return (
        Alexa.getRequestType(handlerInput.requestEnvelope) ===
          "IntentRequest" &&
        (Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.CancelIntent" ||
          Alexa.getIntentName(handlerInput.requestEnvelope) ===
            "AMAZON.StopIntent")
      )
    },
    handle(handlerInput) {
      const speakOutput = "Goodbye!"
      return handlerInput.responseBuilder.speak(speakOutput).getResponse()
    },
  }
  const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      return (
        Alexa.getRequestType(handlerInput.requestEnvelope) ===
        "SessionEndedRequest"
      )
    },
    handle(handlerInput) {
      // Any cleanup logic goes here.
      return handlerInput.responseBuilder.getResponse()
    },
  }

  // The intent reflector is used for interaction model testing and debugging.
  // It will simply repeat the intent the user said. You can create custom handlers
  // for your intents by defining them above, then also adding them to the request
  // handler chain below.
  const IntentReflectorHandler = {
    canHandle(handlerInput) {
      return (
        Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
      )
    },
    handle(handlerInput) {
      const intentName = Alexa.getIntentName(handlerInput.requestEnvelope)
      const speakOutput = `You just triggered ${intentName}`

      return (
        handlerInput.responseBuilder
          .speak(speakOutput)
          //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
          .getResponse()
      )
    },
  }

  // Generic error handling to capture any syntax or routing errors. If you receive an error
  // stating the request handler chain is not found, you have not implemented a handler for
  // the intent being invoked or included it in the skill builder below.
  const ErrorHandler = {
    canHandle() {
      return true
    },
    handle(handlerInput, error) {
      console.log(`~~~~ Error handled: ${error.stack}`)
      const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse()
    },
  }

  const app = express()
  const skillBuilder = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      LaunchRequestHandler,
      HelloWorldIntentHandler,
      HelpIntentHandler,
      CancelAndStopIntentHandler,
      SessionEndedRequestHandler,
      MessageReceived,
      IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(ErrorHandler)
  const skill = skillBuilder.create()
  const adapter = new ExpressAdapter(skill, true, true)
  app.post("/", adapter.getRequestHandlers())
  app.get("/", (req, res) => {
    debug("GET received")
    res.sendStatus(200)
  })
  app.listen(PORT, () => debug(`Listening on ${PORT}`))
}

if (require.main === module) {
  run()
}

export default run
