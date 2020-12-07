#!/usr/bin/env bash

curl -X POST "https://$(cat .secrets/google_dns_username):$(cat .secrets/google_dns_password)@domains.google.com/nic/update?hostname=$(cat .secrets/hostname)&myip=$(cat .secrets/ip)"

kubectl apply -f namespace.yml
kubectl apply -f secrets/htpasswd.json
kubectl apply -f docker-registry.yml
