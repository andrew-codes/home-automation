#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export KUBE_CONFIG=$(vault kv get -format=json cubbyhole/github-action-runners | jq .data.KUBE_CONFIG | sed 's/"//g')
export GITHUB_TOKEN=$(vault kv get -format=json cubbyhole/github-action-runners | jq .data.GITHUB_TOKEN | sed 's/"//g')
export HOME_AUTOMATION_PRIVATE_SSH_KEY=$(vault kv get -format=json cubbyhole/github-action-runners | jq .data.HOME_AUTOMATION_PRIVATE_SSH_KEY | sed 's/"//g')

mkdir -p .secrets
cat <<EOL >.secrets/config-maps.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-config
  namespace: actions-runner-system
data:
  value: "$KUBE_CONFIG"

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: home-automation-private-key
  namespace: actions-runner-system
data:
  value: "$HOME_AUTOMATION_PRIVATE_SSH_KEY"
EOL

kubectl apply -f namespace.yml
kubectl apply -f .secrets/config-maps.yml
kubectl create secret generic controller-manager --namespace="actions-runner-system" --from-literal=github_token="$GITHUB_TOKEN"
kubectl apply -f https://github.com/summerwind/actions-runner-controller/releases/download/v0.16.1/actions-runner-controller.yaml
kubectl apply -f runners.yml
