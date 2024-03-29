#!/usr/bin/env bash
set -e

# Switch to the .devcontainer folder
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -f .secrets/vpnconfig.ovpn ] && [ -f .secrets/vpn.creds ]; then

    # Create a temporary directory
    mkdir -p .secrets
    cd .secrets

    # Touch file to make sure this user can read it
    touch openvpn.log

    # If we are running as root, we do not need to use sudo
    sudo_cmd=""
    if [ "$(id -u)" != "0" ]; then
        sudo_cmd="sudo"
    fi

    # Start up the VPN client using the config stored in vpnconfig.ovpn by save-config.sh
    nohup ${sudo_cmd} /bin/sh -c "openvpn --config .secrets/vpnconfig.ovpn --log openvpn.log --auth-user-pass .secrets/vpn.creds --pull-filter ignore redirect-gateway &" | tee openvpn-launch.log

fi
