#!/usr/bin/env bash

source ../../secrets.sh

curl -X POST "https://$DOCKER_DNS_USERNAME:$DOCKER_DNS_PASSWORD@domains.google.com/nic/update?hostname=$DOCKER_REGISTRY_DOMAIN&myip=$(cat .secrets/ip)"

kubectl apply -f namespace.yml
kubectl apply -f secrets/htpasswd.json
kubectl apply -f docker-registry.yml
