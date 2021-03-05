#!/usr/bin/env bash

kubectl apply -f namespace.yml
kubectl apply -f secrets

mkdir -p tmp
cp service.yml tmp/service.yml
yq eval ".spec.externalIPs[0]=\"$CLUSTER_IP\"" -i tmp/service.yml
kubectl apply -f docker-registry.yml
kubectl apply -f tmp/service.yml

rm -rf tmp
