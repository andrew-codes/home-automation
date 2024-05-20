import { ClientSecretCredential } from "@azure/identity"
import { Client } from "@microsoft/microsoft-graph-client"
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials"

let client: Client | undefined

const getClient = (): Client => {
  if (!client) {
    const credential = new ClientSecretCredential(
      process.env.GUEST_PIN_CODES_TENANT_ID as string,
      process.env.GUEST_PIN_CODES_CLIENT_ID as string,
      process.env.GUEST_PIN_CODES_CLIENT_SECRET as string,
    )

    client = Client.initWithMiddleware({
      authProvider: new TokenCredentialAuthenticationProvider(credential, {
        scopes: ["https://graph.microsoft.com/.default"],
      }),
    })
  }

  return client
}

export default getClient
