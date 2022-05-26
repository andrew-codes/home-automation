#!/usr/bin/env bash

kubectl apply -f deployment/postgres.yml
kubectl apply -f deployment/index.yml

kubectl rollout restart deployment home-assistant
