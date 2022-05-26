#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

export OPENVPN_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "openvpn-PASSWORD" | jq -r '.value')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
openvpn_password: "$OPENVPN_PASSWORD"
EOL

ansible-playbook deployment/index.yml -i deployment/hosts.yml
