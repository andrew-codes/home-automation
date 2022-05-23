#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

export USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-USERNAME" | jq -r '.value')
export PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-PASSWORD" | jq -r '.value')
export EMAIL=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-EMAIL" | jq -r '.value')
export MACHINE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-MACHINE_PASSWORD" | jq -r '.value')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
username: $USERNAME
password: $PASSWORD
email: $EMAIL
EOL

ansible-playbook ./deployment/deploy.yml -i ./deployment/hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
