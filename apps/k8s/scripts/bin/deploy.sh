#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
set -o allexport
source ./.provision-vars.env
set +o allexport
popd

export POD_NETWORK_CIDR=$(az keyvault secret show --vault-name "kv-home-automation" --name "k8s-POD-NETWORK-CIDR" | jq -r '.value')
export MACHINE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "k8s-MACHINE-PASSWORD" | jq -r '.value')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
pod_network_cidr: "$POD_NETWORK_CIDR"
docker_ip: "$PROD_DOCKER_IP"
EOL

cat >./.secrets/flannel-pod-network-cidr.json <<EOL
{"Network": "$POD_NETWORK_CIDR","Backend":{"Type":"vxlan"}}
EOL

ansible-playbook deployment/index.yml -i deployment/hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
export KUBECONFIG=.secrets/.kube/config

envsubst <deployment/external-services.yml | kubectl apply -f -

kubectl create sa app
vault auth enable kubernetes
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update
