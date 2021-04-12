#!/usr/bin/env bash

source ../../external-port-vars.sh

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f alexa-shopping-list-updater-skill.yml
kubectl apply -f service.yml
