#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export INLETS_PRO_LICENSE=$(vault kv get -format=json kv/inlets | jq .data.data.INLETS_PRO_LICENSE | sed -e 's/^"//' -e 's/"$//')
export CLIENT_ID=$(vault kv get -format=json kv/inlets | jq .data.data.CLIENT_ID | sed -e 's/^"//' -e 's/"$//')
export CLIENT_SECRET=$(vault kv get -format=json kv/inlets | jq .data.data.CLIENT_SECRET | sed -e 's/^"//' -e 's/"$//')
export SUBSCRIPTION_ID=$(vault kv get -format=json kv/inlets | jq .data.data.SUBSCRIPTION_ID | sed -e 's/^"//' -e 's/"$//')
export TENANT_ID=$(vault kv get -format=json kv/inlets | jq .data.data.TENANT_ID | sed -e 's/^"//' -e 's/"$//')
export MACHINE_PASSWORD=$(vault kv get -format=json kv/k8s | jq .data.data.MACHINE_PASSWORD | sed -e 's/^"//' -e 's/"$//')

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
