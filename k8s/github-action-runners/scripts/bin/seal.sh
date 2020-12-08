#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# DOCKER CREDS
kubectl create secret docker-registry regcred --dry-run=client --namespace="actions-runner-system" --docker-server="$DOCKER_REGISTRY_DOMAIN:5000" --docker-username="$DOCKER_REGISTRY_USERNAME" --docker-password="$DOCKER_REGISTRY_PASSWORD" --docker-email="$EMAIL" -o json >".secrets/regcred.json"
kubeseal --namespace "actions-runner-system" <".secrets/regcred.json" >"secrets/regcred.json"
rm -rf .secrets/regcred.json

# Kube config
echo "$KUBE_CONFIG" >.secrets/kubectl-config
kubectl create secret generic ssh --dry-run=client --namespace="actions-runner-system" --from-file=kubectl-config=".secrets/kubectl-config" -o json >".secrets/kubectl-config.json"
kubeseal --namespace "actions-runner-system" <".secrets/kubectl-config.json" >"secrets/kubectl-config.json"
rm -rf .secrets/kubectl-config
rm -rf .secrets/kubectl-config.json

# GitHub token
echo "$GITHUB_RUNNER_TOKEN" >.secrets/github_token
kubectl create secret generic controller-manager --dry-run=client --namespace="actions-runner-system" --from-file=github_token=".secrets/github_token" -o json >".secrets/github_token.json"
kubeseal --namespace "actions-runner-system" <".secrets/github_token.json" >"secrets/github_token.json"
rm -rf .secrets/github_token
rm -rf .secrets/github_token.json
