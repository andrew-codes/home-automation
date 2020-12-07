#!/usr/bin/env bash

mkdir -p .secrets/tmp
mkdir -p secrets

docker run -rm --entrypoint htpasswd registry:2.7.1 -Bbn "$(cat .secrets/username) $(cat .secrets/password)" >.secrets/tmp/htpasswd

kubectl apply -f namespace.yml
kubectl create secret generic htpasswd --dry-run=client --namespace="docker-registry" --from-file=.secrets/tmp/htpasswd -o json >.secrets/tmp/htpasswd.json
kubeseal --namespace "docker-registry" <.secrets/tmp/htpasswd.json >secrets/htpasswd.json

kubectl apply -f secrets
rm -rf .secrets/tmp
