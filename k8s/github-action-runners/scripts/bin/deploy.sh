#!/usr/bin/env bash

kubectl apply -f namespace.yml
kubectl apply -f secrets
kubectl apply -f https://github.com/summerwind/actions-runner-controller/releases/latest/download/actions-runner-controller.yaml
kubectl apply -f runners.yml
