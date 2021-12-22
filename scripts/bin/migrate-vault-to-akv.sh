#!/usr/bin/env bash

set -o allexport
source .secrets.env
set +o allexport

source scripts/bin/az-login.sh
VAULT_KV_LIST=$(vault kv list -format=json kv)
echo $VAULT_KV_LIST

for VAULT_NAME in $(echo "${VAULT_KV_LIST}" | jq -r '.[]'); do
    echo "Processing vault kv: ${VAULT_NAME}"
    VAULT_SECRETS=$(vault kv get -format=json "kv/${VAULT_NAME}" | jq '.data.data | to_entries')
    for VAULT_SECRET in $(echo "${VAULT_SECRETS}" | jq -r '.[] | @base64'); do
        _jq() {
            echo ${VAULT_SECRET} | base64 --decode | jq -r ${1}
        }
        SECRET_NAME=$(echo $(_jq '.key'))
        SECRET_VALUE=$(echo $(_jq '.value'))

        KV_SECRET_NAME=$(echo "${VAULT_NAME}-$(echo $SECRET_NAME | sed 's/_/-/g')")
        echo "Setting kv secret named: ${KV_SECRET_NAME}"
        az keyvault secret set --name "${KV_SECRET_NAME}" --vault-name "kv-home-automation" --value "${SECRET_VALUE}"
    done
done
