#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

SECRETS_FILE=./secrets.yml
echo "" >$SECRETS_FILE

AKV_SECRET_KEYS=$(az keyvault secret list --vault-name "kv-home-automation")

for row in $(echo "${AKV_SECRET_KEYS}" | jq -r '.[] | @base64'); do
    _jq() {
        echo ${row} | base64 --decode | jq -r ${1}
    }
    SECRET_NAME=$(echo $(_jq '.name'))
    K8S_SECRET_NAME=$(echo $SECRET_NAME | tr '[:upper:]' '[:lower:]')
    echo "
---
apiVersion: spv.no/v2beta1
kind: AzureKeyVaultSecret
metadata:
  name: $K8S_SECRET_NAME
spec:
  vault:
    name: kv-home-automation
    object:
      name: $SECRET_NAME
      type: secret
  output:
    secret:
      name: $K8S_SECRET_NAME
      dataKey: secret-value" >>$SECRETS_FILE
done

kubectl apply -f secrets.yml
