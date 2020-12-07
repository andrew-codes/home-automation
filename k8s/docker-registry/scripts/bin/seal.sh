#!/usr/bin/env bash

mkdir -p .secrets/tmp
mkdir -p secrets

kubectl apply -f namespace.yml
kubectl create secret generic docker-registry --dry-run=client --namespace="docker-registry" --from-file=".secrets/username" --from-file=".secrets/password" -o json >.secrets/tmp/docker-registry.json
kubeseal --namespace "docker-registry" <.secrets/tmp/docker-registry.json >secrets/docker-registry.json

kubectl apply -f secrets
rm -rf .secrets/tmp
