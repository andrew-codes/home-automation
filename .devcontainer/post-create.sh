#!/usr/bin/env bash
set -e

# Ansible
pip3 install "pywinrm>=0.3.0"
pip3 install "PyYAML"
ansible-galaxy collection install ansible.windows
ansible-galaxy collection install community.windows
ansible-galaxy collection install kubernetes.core

# Jsonnet
go install github.com/google/go-jsonnet/cmd/jsonnet@latest
go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
ln -s $(go env GOPATH)/bin/jb /usr/local/bin

# kubectl
mkdir -p ~/.kube
echo -e "$(op read op://$OP_CONNECT_VAULT_ID/s6mbwk4ppivpoyjgmzba3nsyu4/secret-value)" >~/.kube/config

touch .secrets.env
echo -e "

ONEPASSWORD_SERVER_URL="$OP_CONNECT_HOST"
ONEPASSWORD_TOKEN="$OP_CONNECT_TOKEN"
ONEPASSWORD_VAULT_ID="$OP_CONNECT_VAULT_ID"

" >.secrets.env

corepack enable
