#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export USERNAME=$(vault kv get -format=json kv/docker-registry | jq .data.USERNAME)
export PASSWORD=$(vault kv get -format=json kv/docker-registry | jq .data.PASSWORD)
export EMAIL=$(vault kv get -format=json kv/docker-registry | jq .data.EMAIL)
export MACHINE_PASSWORD=$(vault kv get -format=json kv/docker-registry | jq .data.MACHINE_PASSWORD])

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
username: $USERNAME
password: $PASSWORD
email: $EMAIL
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
