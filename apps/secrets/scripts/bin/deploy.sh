#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .provision-vars.env
set +o allexport
popd

mkdir -p .secrets
SECRETS_FILE=./.secrets/secrets.yml
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

kubectl apply -f .secrets/secrets.yml

export SSH_KEY=$(az keyvault secret show --vault-name "kv-home-automation" --name "github-action-runners-HOME-AUTOMATION-PRIVATE-SSH-KEY" | jq -r '.value')
export KNOWN_HOSTS=$(az keyvault secret show --vault-name "kv-home-automation" --name "known-hosts" | jq -r '.value')

mkdir -p tmp
echo -e "$SSH_KEY" >tmp/id_rsa
echo -e "$KNOWN_HOSTS" >tmp/known_hosts
kubectl delete secret ssh
kubectl create secret generic ssh --from-file=tmp/known_hosts --from-file=tmp/id_rsa