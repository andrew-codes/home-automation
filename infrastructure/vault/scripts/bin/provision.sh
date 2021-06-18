#!/usr/bin/env bash

terraform init
terraform plan
terraform apply -auto-approve
