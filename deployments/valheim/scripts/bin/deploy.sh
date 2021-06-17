#!/usr/bin/env bash

source ../../external-port-vars.sh
yq eval '.spec.ports[0].nodePort=env(VALHEIM_GAME_1_PORT)' -i service.yml
yq eval '.spec.ports[1].nodePort=env(VALHEIM_GAME_2_PORT)' -i service.yml
yq eval '.spec.ports[2].nodePort=env(VALHEIM_GAME_3_PORT)' -i service.yml

kubectl apply -f secrets
kubectl apply -f volumes.yml
kubectl apply -f app.yml
kubectl apply -f service.yml
