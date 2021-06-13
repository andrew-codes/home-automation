#!/usr/bin/env bash

kubectl apply -f namespace.yml
kubectl apply -f secrets

source ../../external-port-vars.sh

mkdir -p tmp
cp service.yml tmp/service.yml
yq eval ".spec.externalIPs[0]=\"$CLUSTER_IP\"" -i tmp/service.yml
yq eval '.spec.ports[0].nodePort=env(EXTERNAL_DOCKER_REGISTIRY_PORT)' -i service.yml
kubectl apply -f docker-registry.yml
kubectl apply -f tmp/service.yml

rm -rf tmp
