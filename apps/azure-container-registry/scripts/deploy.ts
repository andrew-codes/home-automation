import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace/src/Configuration.types"
import { EnvironmentCredential } from "@azure/identity"
import { ContainerRegistryManagementClient } from '@azure/arm-containerregistry'
import type { Registry } from '@azure/arm-containerregistry'
import sh from 'shelljs'

const run = async (
    configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
    const credential = new EnvironmentCredential();
    const subscriptionId = await configurationApi.get('azure/subscription/id')
    const client = new ContainerRegistryManagementClient(credential, subscriptionId)

    const resourceGroup = await configurationApi.get('azure/resource-group')
    const registryName = await configurationApi.get('docker-registry/name')
    const externalIp = sh.exec('curl https://checkip.amazonaws.com').stdout
    const parameters: Registry = {
        location: "eastus",
        sku: {
            name: 'premium'
        },
        networkRuleSet: {
            defaultAction: 'Deny',
            ipRules: [{
                action: 'Allow',
                iPAddressOrRange: externalIp
            }]
        }
    }
    await client.registries.beginCreateAndWait(resourceGroup, registryName, parameters)
}

export default run
