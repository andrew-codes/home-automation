#!/usr/bin/env bash

kubectl apply -f deployment/index.yml

kubectl rollout restart deployment guest-pin-codes
