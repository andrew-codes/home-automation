#!/usr/bin/env bash

source ../../secrets.sh

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f home-assistant.yml
