#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

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

export PUBLIC_KEY=$(az keyvault secret show --vault-name "kv-home-automation" --name "github-action-runners-HOME-AUTOMATION-PUBLIC-KEY" | jq -r '.value')
echo -e "$PUBLIC_KEY" >.secrets/ha.pub

sudo ansible-playbook deployment/index.yml -i deployment/hosts.yml
