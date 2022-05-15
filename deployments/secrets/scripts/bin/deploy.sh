#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

SECRETS_FILE=./secrets.yml
echo "" >$SECRETS_FILE

if [ ! -f src/id_rsa ]; then
  echo "No SSH File"
  ssh-keygen -t rsa -f src/id_rsa -q -N ""
fi

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "github-action-runners-HOME-AUTOMATION-PRIVATE-SSH-KEY" --file src/id_rsa
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "known-hosts" --file src/known_hosts

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
kubectl delete secret ssh
kubectl create secret generic ssh --from-file=./src/known_hosts --from-file=src/id_rsa
