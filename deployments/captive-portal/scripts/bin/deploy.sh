#!/usr/bin/env bash

source ../../external-port-vars.sh
yq eval '.spec.ports[0].nodePort=env(EXTERNAL_CAPTIVE_PORTAL_PORT)' -i service.yml

kubectl apply -f namespace.yml
kubectl apply -f captive-portal.yml
kubectl apply -f service.yml
