import createDebug from "debug"
import HomeAssistant from "homeassistant"
import { createDataProvider as createHomeAssistantDataProvider } from "./dataProvider/homeAssistant"
const debug = createDebug("@ha/graphql-api/dataContext")

const createDataContext = (haConfig) => {
  const ha = new HomeAssistant({
    host: haConfig.host,
    port: haConfig.port,
    token: haConfig.token,
    ignoreCert: true,
  })
  const haProvider = createHomeAssistantDataProvider(ha)

  return {
    ha,
    query: async (q) => {
      try {
        const output = await haProvider.query(q)
        return output
      } catch (error) {
        debug(error)
        return []
      }
    },
  }
}

export { createDataContext }
