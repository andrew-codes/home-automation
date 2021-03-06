#!/usr/bin/env bash

source ../../external-port-vars.sh
yq eval '.spec.ports[0].nodePort=env(EXTERNAL_GRAPHQL_PORT)' -i service.yml
yq eval '.spec.ports[1].nodePort=env(EXTERNAL_GRAPHQL_SUB_PORT)' -i service.yml

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f graphql-api.yml
kubectl apply -f service.yml
