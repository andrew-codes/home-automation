#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source ./.provision-vars.env
set +o allexport
popd
export POD_NETWORK_CIDR=$(vault kv get -format=json kv/k8s | jq .data.data.POD_NETWORK_CIDR | sed -e 's/^"//' -e 's/"$//')
export MACHINE_PASSWORD=$(vault kv get -format=json kv/k8s | jq .data.data.MACHINE_PASSWORD | sed -e 's/^"//' -e 's/"$//')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
pod_network_cidr: "$POD_NETWORK_CIDR"
docker_ip: "$PROD_DOCKER_IP"
EOL

mkdir -p .secrets
cat >./.secrets/flannel-pod-network-cidr.json <<EOL
{"Network": "$POD_NETWORK_CIDR","Backend":{"Type":"vxlan"}}
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"

export KUBECONFIG=.secrets/.kubeconfig

envsubst <external-services.yml | kubectl apply -f -

kubectl create sa app
vault auth enable kubernetes
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update
helm install vault hashicorp/vault --set "injector.externalVaultAddr=http://vault:8200"
VAULT_HELM_SECRET_NAME=$(kubectl get secrets --output=json | jq -r '.items[].metadata | select(.name|startswith("vault-token-")).name')
TOKEN_REVIEW_JWT=$(kubectl get secret $VAULT_HELM_SECRET_NAME --output='go-template={{ .data.token }}' | base64 --decode)
KUBE_CA_CERT=$(kubectl config view --raw --minify --flatten --output='jsonpath={.clusters[].cluster.certificate-authority-data}' | base64 --decode)
KUBE_HOST=$(kubectl config view --raw --minify --flatten --output='jsonpath={.clusters[].cluster.server}')
vault write auth/kubernetes/config \
    issuer="https://kubernetes.default.svc.cluster.local" \
    token_reviewer_jwt="$TOKEN_REVIEW_JWT" \
    kubernetes_host="$KUBE_HOST" \
    kubernetes_ca_cert="$KUBE_CA_CERT"
vault write auth/kubernetes/role/app \
    bound_service_account_names=app \
    bound_service_account_namespaces=default \
    policies=app \
    ttl=24h
