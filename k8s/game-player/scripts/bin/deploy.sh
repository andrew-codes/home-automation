#!/usr/bin/env bash

source ../../external-port-vars.sh
yq eval '.spec.ports[0].nodePort=env(EXTERNAL_GAME_PLAYER_PORT)' -i service.yml

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f game-player.yml
kubectl apply -f service.yml
