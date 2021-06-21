#!/usr/bin/env bash

set -o allexport
source ./.secrets.env
set +o allexport

vault login $VAULT_TOKEN
