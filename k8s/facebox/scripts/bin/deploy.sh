#!/usr/bin/env bash

source ../../external-port-vars.sh
yq eval '.spec.ports[0].nodePort=env(EXTERNAL_FACEBOX_PORT)' -i service.yml

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f facebox.yml
kubectl apply -f service.yml