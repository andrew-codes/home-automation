#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

echo -n "$COMPREFACE_POSTGRES_DB" >.secrets/compreface_postgres_db
echo -n "$COMPREFACE_POSTGRES_USERNAME" >.secrets/compreface_postgres_username
echo -n "$COMPREFACE_POSTGRES_PASSWORD" >.secrets/compreface_postgres_password
kubectl create secret generic compreface-postgres-secrets --dry-run=client --namespace="home-automation" --from-file=db=".secrets/compreface-postgres-db" --from-file=username=".secrets/compreface-postgres-username" --from-file=password=".secrets/compreface-postgres-password" -o json >".secrets/compreface-postgres-secrets.json"
kubeseal --namespace "home-automation" <".secrets/compreface-postgres-secrets.json" >"secrets/compreface-postgres-secrets.json"
rm -rf .secrets/compreface_postgres_db
rm -rf .secrets/compreface_postgres_username
rm -rf .secrets/compreface_postgres_password
rm -rf .secrets/compreface-postgres-secrets.json
