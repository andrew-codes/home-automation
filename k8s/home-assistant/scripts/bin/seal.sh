#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# DOCKER CREDS
kubectl create secret docker-registry regcred --dry-run=client --namespace="home-automation" --docker-server="$DOCKER_REGISTRY_DOMAIN:5000" --docker-username="$DOCKER_REGISTRY_USERNAME" --docker-password="$DOCKER_REGISTRY_PASSWORD" --docker-email="$EMAIL" -o json >".secrets/regcred.json"
kubeseal --namespace "home-automation" <".secrets/regcred.json" >"secrets/regcred.json"
# kubectl apply -f secrets/regcred.json
rm -rf .secrets/regcred.json

# Config Checkokut SSH
echo "$HOME_ASSISTANT_ID_RSA" >.secrets/id_rsa
kubectl create secret generic ssh --dry-run=client --namespace="home-automation" --from-file=id_rsa=".secrets/id_rsa" -o json >".secrets/ssh.json"
kubeseal --namespace "home-automation" <".secrets/ssh.json" >"secrets/ssh.json"
# kubectl apply -f secrets/ssh.json
rm -rf .secrets/id_rsa
rm -rf .secrets/ssh.json

# HA Secrets
kubectl create secret generic secrets --dry-run=client --namespace="home-automation" --from-file=yml="home-assistant-config/secrets.yml" -o json >".secrets/secrets.json"
kubeseal --namespace "home-automation" <".secrets/secrets.json" >"secrets/secrets.json"
# kubectl apply -f secrets/secrets.json
rm -rf .secrets/secrets.json

echo "$HOME_ASSISTANT_REPO_URL" >.secrets/repo-url
kubectl create secret generic repo-url --dry-run=client --namespace="home-automation" --from-file=value=".secrets/repo-url" -o json >".secrets/repo-url.json"
kubeseal --namespace "home-automation" <".secrets/repo-url.json" >"secrets/repo-url.json"
# kubectl apply -f secrets/repo-url.json
rm -rf .secrets/repo-url
rm -rf .secrets/repo-url.json
