#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export POD_NETWORK_CIDR=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.pod-network-cidr | sed 's/"//g')
export MACHINE_PASSWORD=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.machine-password | sed 's/"//g')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
pod_network_cidr: "$POD_NETWORK_CIDR"
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
