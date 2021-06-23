#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export USERNAME=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.username)
export PASSWORD=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.password)
export EMAIL=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.email)

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
username: $USERNAME
password: $PASSWORD
email: $EMAIL
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
