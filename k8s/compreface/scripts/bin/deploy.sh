#!/usr/bin/env bash

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_COMPREFACE_FE_PORT)' -i service.yml
yq eval '.spec.ports[1].nodePort=env(EXTERNAL_COMPREFACE_ADMIN_PORT)' -i service.yml

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f compreface-postgres.yml
kubectl apply -f compreface.yml
kubectl apply -f service.yml