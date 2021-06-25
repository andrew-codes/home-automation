#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source ./.provision-vars.env
set +o allexport
popd
export POD_NETWORK_CIDR=$(vault kv get -format=json cubbyhole/k8s | jq .data.POD_NETWORK_CIDR | sed 's/"//g')
export MACHINE_PASSWORD=$(vault kv get -format=json cubbyhole/k8s | jq .data.MACHINE_PASSWORD | sed 's/"//g')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
pod_network_cidr: "$POD_NETWORK_CIDR"
docker-ip: "$PROD_DOCKER_IP"
EOL

mkdir -p .secrets
cat >./.secrets/flannel-pod-network-cidr.json <<EOL
{"Network": "$POD_NETWORK_CIDR","Backend":{"Type":"vxlan"}}
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
