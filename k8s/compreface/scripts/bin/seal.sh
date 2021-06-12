#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

echo -n "$COMPREFACE_POSTGRES_DB" >.secrets/compreface_postgres_db
echo -n "$COMPREFACE_POSTGRES_USERNAME" >.secrets/compreface_postgres_username
echo -n "$COMPREFACE_POSTGRES_PASSWORD" >.secrets/compreface_postgres_password
kubectl create secret generic compreface-postgres-secrets --dry-run=client --namespace="home-automation" --from-file=db=".secrets/compreface_postgres_db" --from-file=username=".secrets/compreface_postgres_username" --from-file=password=".secrets/compreface_postgres_password" -o json >".secrets/compreface-postgres-secrets.json"
kubeseal --namespace "home-automation" <".secrets/compreface-postgres-secrets.json" >"secrets/compreface-postgres-secrets.json"
rm -rf .secrets/compreface_postgres_db
rm -rf .secrets/compreface_postgres_username
rm -rf .secrets/compreface_postgres_password
rm -rf .secrets/compreface-postgres-secrets.json

echo -n "jdbc:postgresql://compreface-postgres:5432/${COMPREFACE_POSTGRES_DB}" >.secrets/db_url
kubectl create secret generic compreface-api-secrets --dry-run=client --namespace="home-automation" --from-file=db_url=".secrets/db_url" -o json >".secrets/compreface-api-secrets.json"
kubeseal --namespace "home-automation" <".secrets/compreface-api-secrets.json" >"secrets/compreface-api-secrets.json"
rm -rf .secrets/db_url
rm -rf .secrets/compreface-api-secrets.json

echo -n "$EMAIL_HOST" >.secrets/email_host
echo -n "$EMAIL_USERNAME" >.secrets/email_username
echo -n "$EMAIL_FROM" >.secrets/email_from
echo -n "$EMAIL_PASSWORD" >.secrets/email_password
kubectl create secret generic compreface-admin-secrets --dry-run=client --namespace="home-automation" --from-file=email_host=".secrets/email_host"  --from-file=email_username=".secrets/email_username" --from-file=email_from=".secrets/email_from" --from-file=email_password=".secrets/email_password" -o json >".secrets/compreface-admin-secrets.json"
kubeseal --namespace "home-automation" <".secrets/compreface-admin-secrets.json" >"secrets/compreface-admin-secrets.json"
rm -rf .secrets/email_host
rm -rf .secrets/email_username
rm -rf .secrets/email_from
rm -rf .secrets/email_password
rm -rf .secrets/compreface-admin-secrets.json