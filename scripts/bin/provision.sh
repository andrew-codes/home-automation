#!/usr/bin/env bash

[ -z $1 ] && exit "Infrastructure name must be provided"
[ -z $2 ] && exit "Instance .env must be provided"

set -o allexport
source ./.secrets.env
source ./.provision-vars.env
source ./infrastructure/$1/$2
set +o allexport

(cd ./infrastructure/$1 && \
terraform init && \
terraform plan && \
terraform apply -auto-approve)
