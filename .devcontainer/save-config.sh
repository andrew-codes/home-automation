#!/usr/bin/env bash
set -e

# Switch to the .devcontainer folder
cd "$(dirname "${BASH_SOURCE[0]}")"

# Create a temporary directory
mkdir -p openvpn-tmp
cd openvpn-tmp

# Save the configuration from the secret if it is present
if [ ! -z "${OPENVPN_CONFIG}" ]; then
    echo "${OPENVPN_CONFIG}" >vpnconfig.ovpn
fi

# Save the configuration from the secret if it is present
if [ ! -z "${K8s_CONFIG}" ]; then
    mkdir -p ~/.kube
    echo -e "${K8s_CONFIG}" >~/.kube/config
fi

# Save the configuration from the secret if it is present
if [ ! -z "${ID_RSA}" ]; then
    mkdir -p ~/.ssh
    echo -e "${ID_RSA}" >~/.ssh/id_rsa_2
fi
