#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export CERT_EMAIL=$(az keyvault secret show --vault-name "kv-home-automation" --name "dns-cert-email" | jq -r '.value')
export DNS_GOOGLE_SA_CREDS=$(az keyvault secret show --vault-name "kv-home-automation" --name "dns-google-service-account-creds" | jq -r '.value')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
cert_email: "$CERT_EMAIL"
EOL
cat >.secrets/google.json <<EOL
$DNS_GOOGLE_SA_CREDS
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml