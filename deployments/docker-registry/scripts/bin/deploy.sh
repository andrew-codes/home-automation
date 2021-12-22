#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-USERNAME")
export PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-PASSWORD")
export EMAIL=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-EMAIL")
export MACHINE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-MACHINE_PASSWORD")

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
username: $USERNAME
password: $PASSWORD
email: $EMAIL
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
