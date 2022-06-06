#!/usr/bin/env bash
set -e

# Switch to the .devcontainer folder
cd "$(dirname "${BASH_SOURCE[0]}")"

# Create a temporary directory
mkdir -p .secrets
cd .secrets

# Save the configuration from the secret if it is present
if [ ! -z "${OPENVPN_CONFIG}" ]; then
    echo "${OPENVPN_CONFIG}" >vpnconfig.ovpn
fi

# Save the configuration from the secret if it is present
if [ ! -z "${K8S_CONFIG}" ]; then
    mkdir -p ~/.kube
    echo -e "${K8S_CONFIG}" >~/.kube/config
fi

# Save the configuration from the secret if it is present
if [ ! -z "${ID_RSA}" ]; then
    mkdir -p ~/.ssh
    echo -e "${ID_RSA}" >~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
fi

# Save the configuration from the secret if it is present
if [ ! -z "${VPN_CREDS}" ]; then
    echo -e "${VPN_CREDS}" >vpn.creds
fi

# Save the configuration from the secret if it is present
if [ ! -z "${HOME_AUTOMATION_SECRETS_ENV}" ]; then
    echo -e "${HOME_AUTOMATION_SECRETS_ENV}" >../../.secrets.env
fi
