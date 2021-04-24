#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# UNIFI
echo -n "$GOOGLE_GUEST_CALENDAR_ID" >.secrets/calendar_id
echo -n "$GOOGLE_GUEST_CALENDAR_PRIVATE_KEY" >.secrets/private_key
echo -n "$GOOGLE_GUEST_CALENDAR_SERVICE_ACCOUNT" >.secrets/service_account
kubectl create secret generic google-guest-calendar-secrets --dry-run=client --namespace="home-automation" --from-file=calendar_id=".secrets/calendar_id" --from-file=private_key=".secrets/private_key" --from-file=service_account=".secrets/service_account" -o json >".secrets/google-guest-calendar-secrets.json"
kubeseal --namespace "home-automation" <".secrets/google-guest-calendar-secrets.json" >"secrets/google-guest-calendar-secrets.json"
rm -rf .secrets/calendar_id
rm -rf .secrets/private_key
rm -rf .secrets/service_account
rm -rf .secrets/google-guest-calendar-secrets.json

echo -n "$GUEST_LOCK_ENTITY_PREFIXES" >.secrets/guest_lock_entity_prefixes
echo -n "$GUEST_LOCK_CODE_EXCLUSIONS" >.secrets/guest_lock_code_exclusions
kubectl create secret generic guest-lock-entity-secrets --dry-run=client --namespace="home-automation" --from-file=guest_lock_entity_prefixes=".secrets/guest_lock_entity_prefixes" --from-file=guest_lock_code_exclusions=".secrets/guest_lock_code_exclusions" -o json >".secrets/guest-lock-entity-prefixes.json"
kubeseal --namespace "home-automation" <".secrets/guest-lock-entity-prefixes.json" >"secrets/guest-lock-entity-secrets.json"
rm -rf .secrets/guest_lock_entity_prefixes
rm -rf .secrets/guest_lock_code_exclusions
rm -rf .secrets/guest-lock-entity-prefixes.json
