#!/usr/bin/env bash

docker kill $(docker ps -f name=home-assistant -q)
kubectl rollout restart deployment home-assistant
