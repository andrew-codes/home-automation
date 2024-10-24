#!/usr/bin/env bash
set -e

/usr/local/share/docker-init.sh

corepack enable
corepack use yarn
yarn set version 4.5.1
yarn dlx @yarnpkg/sdks vscode

go install github.com/google/go-jsonnet/cmd/jsonnet@latest
go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
ln -s $(go env GOPATH)/bin/jb /usr/local/bin

pip3 install "pywinrm>=0.3.0"
pip3 install "PyYAML"
ansible-galaxy collection install ansible.windows
ansible-galaxy collection install community.windows
ansible-galaxy collection install kubernetes.core

git config --global --add safe.directory /workspaces/home-automation

jb install

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv ./kubectl /usr/bin/kubectl
