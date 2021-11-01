#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export USERNAME=$(vault kv get -format=json kv/docker-registry | jq .data.data.USERNAME | sed -e 's/^"//' -e 's/"$//')
export PASSWORD=$(vault kv get -format=json kv/docker-registry | jq .data.data.PASSWORD | sed -e 's/^"//' -e 's/"$//')
export EMAIL=$(vault kv get -format=json kv/docker-registry | jq .data.data.EMAIL | sed -e 's/^"//' -e 's/"$//')
export MACHINE_PASSWORD=$(vault kv get -format=json kv/docker-registry | jq .data.data.MACHINE_PASSWORD | sed -e 's/^"//' -e 's/"$//')
echo $MACHINE_PASSWORD
mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
username: $USERNAME
password: $PASSWORD
email: $EMAIL
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
