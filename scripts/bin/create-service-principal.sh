#!/usr/bin/env bash

pushd .
set -o allexport
source .secrets.env
set +o allexport
popd

az ad sp create-for-rbac --name $AZURE_SERVICE_PRINCIPAL_NAME --role Contributor
