#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export INLETS_PRO_LICENSE=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.inlets_pro_license | sed 's/"//g')
export CLIENT_ID=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.client_id)
export CLIENT_SECRET=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.client_secret)
export SUBSCRIPTION_ID=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.subscription_id)
export TENANT_ID=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.tenant_id)

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
azure_inlets_subscription_id: $SUBSCRIPTION_ID
EOL

cat >.secrets/inlets-pro.license=$INLETS_PRO_LICENSE

cat >.secrets/azure-cloud-credentials.json <<EOL
{
    "clientId": $CLIENT_ID,
    "clientSecret": $CLIENT_SECRET,
    "subscriptionId": $SUBSCRIPTION_ID,
    "tenantId": $TENANT_ID,
    "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
    "resourceManagerEndpointUrl": "https://management.azure.com/",
    "activeDirectoryGraphResourceId": "https://graph.windows.net/",
    "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
    "galleryEndpointUrl": "https://gallery.azure.com/",
    "managementEndpointUrl": "https://management.core.windows.net/"
}
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
