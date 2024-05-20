// import path from "path"
import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import path from "path"
import sh from "shelljs"
import fs from "fs/promises"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  //   sh.exec(`az login`)

  const resourceGroup = "rg-velero"
  sh.exec(`az group create -n ${resourceGroup} --location EastUS`)

  const storageAccountId = await configurationApi.get(
    "velero/storage-account-id",
  )
  sh.exec(`az storage account create \
--name ${storageAccountId.value} \
--resource-group ${resourceGroup} \
--sku Standard_GRS \
--encryption-services blob \
--https-only true \
--min-tls-version TLS1_2 \
--kind BlobStorage \
--access-tier Hot`)

  const blobContainer = "velero"
  sh.exec(
    `az storage container create -n ${blobContainer} --public-access off --account-name ${storageAccountId.value}`,
  )

  const azureRole = "Contributor"
  const subscriptionId = await configurationApi.get("velero/subscription-id")
  const clientSecret = sh
    .exec(
      `az ad sp create-for-rbac --name "velero" --role ${azureRole} --query 'password' -o tsv --scopes  /subscriptions/${subscriptionId.value}`,
    )
    .trim()
  await configurationApi.set("velero/client-secret", clientSecret)

  const clientId = sh
    .exec(`az ad sp list --display-name "velero" --query '[0].appId' -o tsv`)
    .trim()
  await configurationApi.set("velero/client-id", clientId)

  sh.exec(
    `az role assignment create --assignee ${clientId} --role "Storage Blob Data Contributor" --scope /subscriptions/${subscriptionId.value}`,
  )

  const tenantId = await configurationApi.get("velero/tenant-id")

  const creds = `
AZURE_SUBSCRIPTION_ID=${subscriptionId.value}
AZURE_TENANT_ID=${tenantId.value}
AZURE_CLIENT_ID=${clientId}
AZURE_CLIENT_SECRET=${clientSecret}
AZURE_RESOURCE_GROUP=${resourceGroup}
AZURE_CLOUD_NAME=AzurePublicCloud`
  await configurationApi.set("velero/creds", creds)
  const secretsDirPath = path.join(__dirname, "..", ".secrets")
  await fs.mkdir(secretsDirPath)
  const credsPath = path.join(secretsDirPath, "creds")
  await fs.writeFile(credsPath, creds, "utf8")

  sh.exec(`velero install \
  --provider azure \
  --use-node-agent
  --plugins velero/velero-plugin-for-microsoft-azure:master \
  --bucket ${blobContainer} \
  --secret-file ${credsPath} \
  --backup-location-config resourceGroup=${resourceGroup},storageAccount=${storageAccountId.value},subscriptionId=${subscriptionId.value} \
  --snapshot-location-config apiTimeout=5m,resourceGroup=${resourceGroup},subscriptionId=${subscriptionId.value}`)
}

export default run
