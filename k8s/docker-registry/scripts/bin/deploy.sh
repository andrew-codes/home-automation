#!/usr/bin/env bash

kubectl apply -f namespace.yml
kubectl apply -f secrets/docker-registry.yml
kubectl apply -f docker-registry.yml
