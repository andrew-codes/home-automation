#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export INLETS_PRO_LICENSE=$(az keyvault secret show --vault-name "kv-home-automation" --name "inlets-INLETS-PRO-LICENSE" | jq -r '.value')
export CLIENT_ID=$(az keyvault secret show --vault-name "kv-home-automation" --name "inlets-CLIENT-ID" | jq -r '.value')
export CLIENT_SECRET=$(az keyvault secret show --vault-name "kv-home-automation" --name "inlets-CLIENT-SECRET" | jq -r '.value')
export SUBSCRIPTION_ID=$(az keyvault secret show --vault-name "kv-home-automation" --name "inlets-SUBSCRIPTION-ID" | jq -r '.value')
export TENANT_ID=$(az keyvault secret show --vault-name "kv-home-automation" --name "inlets-TENANT-ID" | jq -r '.value')
export MACHINE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "k8s-MACHINE-PASSWORD" | jq -r '.value')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
azure_inlets_subscription_id: $SUBSCRIPTION_ID
EOL
echo -n $INLETS_PRO_LICENSE >.secrets/inlets-pro.license
cat >.secrets/azure-cloud-credentials.json <<EOL
{
    "clientId": "$CLIENT_ID",
    "clientSecret": "$CLIENT_SECRET",
    "subscriptionId": "$SUBSCRIPTION_ID",
    "tenantId": "$TENANT_ID",
    "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
    "resourceManagerEndpointUrl": "https://management.azure.com/",
    "activeDirectoryGraphResourceId": "https://graph.windows.net/",
    "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
    "galleryEndpointUrl": "https://gallery.azure.com/",
    "managementEndpointUrl": "https://management.core.windows.net/"
}
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
