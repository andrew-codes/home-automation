import type { ConfigurationApi } from "@ha/configuration-api"
import type { EnvConfiguration } from "@ha/configuration-workspace/src/Configuration.types"
import { EnvironmentCredential } from "@azure/identity"
import {
    KeyVaultManagementClient,
    VaultCreateOrUpdateParameters,
} from "@azure/arm-keyvault"
import sh from 'shelljs'

const run = async (
    configurationApi: ConfigurationApi<EnvConfiguration>,
): Promise<void> => {
    const credential = new EnvironmentCredential();
    const subscriptionId = await configurationApi.get('azure/subscription/id')
    const kvClient = new KeyVaultManagementClient(credential, subscriptionId);

    const tenantId = await configurationApi.get('azure/tenant/id')
    const objectId = await configurationApi.get('azure/client/object/id')
    const clientId = await configurationApi.get('azure/client/id')
    const resourceGroup = await configurationApi.get('azure/resource-group')
    const vaultName = await configurationApi.get('azure/key-vault/name')
    const parameter: VaultCreateOrUpdateParameters = {
        location: "eastus",
        properties: {
            tenantId: tenantId,
            sku: {
                family: "A",
                name: "standard",
            },
            accessPolicies: [
                {
                    tenantId: tenantId,
                    objectId: objectId,
                    permissions: {
                        keys: [
                            "encrypt",
                            "decrypt",
                            "wrapKey",
                            "unwrapKey",
                            "sign",
                            "verify",
                            "get",
                            "list",
                            "create",
                            "update",
                            "import",
                            "delete",
                            "backup",
                            "restore",
                            "recover",
                            "purge",
                        ],
                        secrets: [
                            "get",
                            "list",
                            "set",
                            "delete",
                            "backup",
                            "restore",
                            "recover",
                            "purge",
                        ],
                        certificates: [
                            "get",
                            "list",
                            "delete",
                            "create",
                            "import",
                            "update",
                            "managecontacts",
                            "getissuers",
                            "listissuers",
                            "setissuers",
                            "deleteissuers",
                            "manageissuers",
                            "recover",
                            "purge",
                        ],
                    },
                },
            ],
            enabledForDeployment: false,
            enabledForDiskEncryption: false,
            enabledForTemplateDeployment: false,
        },
    };
    try {
        await kvClient.vaults
            .beginCreateOrUpdateAndWait(resourceGroup, vaultName, parameter)
    } catch (error) {
        console.log(JSON.stringify(error, null, 2))
        throw error
    }

    const clientSecret = await configurationApi.get('azure/client/secret')
    const command = `kubectl create ns akv2k8s;
helm repo add spv-charts https://charts.spvapi.no;
helm repo update;
helm upgrade --install akv2k8s spv-charts/akv2k8s \
    --namespace akv2k8s \
    --set global.keyVaultAuth=environment \
    --set global.env.AZURE_TENANT_ID=${tenantId} \
    --set global.env.AZURE_CLIENT_ID=${clientId} \
    --set global.env.AZURE_CLIENT_SECRET=${clientSecret} \
    --set global.logLevel=debug;`

    sh.exec(command, { silent: true })
}

export default run
