#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# HTPASSWD
docker run --rm --entrypoint htpasswd registry:2.7.0 -Bbn "$DOCKER_REGISTRY_USERNAME" "$DOCKER_REGISTRY_PASSWORD" >".secrets/htpasswd"
kubectl create secret generic htpasswd --dry-run=client --namespace="docker-registry" --from-file=".secrets/htpasswd" -o json >".secrets/htpasswd.json"
kubeseal --namespace "docker-registry" <".secrets/htpasswd.json" >"secrets/htpasswd.json"
rm -rf .secrets/htpasswd
rm -rf .secrets/htpasswd.json

# Self-signed SSL Cert
docker run --rm -v $(pwd)/.secrets:/export frapsoft/openssl req -newkey rsa:4096 -nodes -sha256 -keyout /export/domain.key -x509 -days 365 -out export/domain.crt -subj "/CN=$DOCKER_REGISTRY_DOMAIN\/emailAddress=admin@$EMAIL/C=US/ST=$DOCKER_REGISTRY_CERT_STATE/L=$DOCKER_REGISTRY_CERT_CITY/O=$DOCKER_REGISTRY_CERT_ORG/OU=Home Automation"
kubectl create secret generic cert --dry-run=client --namespace="docker-registry" --from-file=key=".secrets/domain.key" --from-file=crt=".secrets/domain.crt" -o json >".secrets/cert.json"
kubeseal --namespace "docker-registry" <".secrets/cert.json" >"secrets/cert.json"
rm -rf .secrets/cert.json
rm -rf .secrets/domain.key
rm -rf .secrets/domain.crt
