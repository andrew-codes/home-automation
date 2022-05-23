#!/usr/bin/env bash

kubectl apply -f deployment/postgres.yml
kubectl apply -f deployment/home-assistant.yml

kubectl rollout restart deployment home-assistant
