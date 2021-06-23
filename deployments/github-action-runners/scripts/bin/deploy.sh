#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export KUBE_CONFIG=$(vault kv get -format=json cubbyhole/github-action-runners | jq .data.kube-config | sed 's/"//g')
export GITHUB_TOKEN=$(vault kv get -format=json cubbyhole/github-action-runners | jq .data.github-token | sed 's/"//g')
export HOME_AUTOMATION_PRIVATE_SSH_KEY=$(vault kv get -format=json cubbyhole/github-action-runners | jq .data.home-automation-private-ssh-key | sed 's/"//g')

mkdir -p .secrets
echo -n "$(
  cat <<EOL
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-config
  namespace: actions-runner-system
data: |
  $KUBE_CONFIG

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: home-automation-private-key
  namespace: actions-runner-system
data: |
  $HOME_AUTOMATION_PRIVATE_SSH_KEY

---
EOL
)" >>.secrets/config-maps.yml

kubectl apply -f namespace.yml
kubectl apply -f .secrets/config-maps.yml
kubectl create secret generic controller-manager --namespace="actions-runner-system" --from-literal=github_token="$GITHUB_TOKEN"
kubectl apply -f https://github.com/summerwind/actions-runner-controller/releases/download/v0.16.1/actions-runner-controller.yaml
kubectl apply -f runners.yml
