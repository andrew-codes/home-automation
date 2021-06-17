#!/usr/bin/env bash

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f guest-pin-codes.yml
