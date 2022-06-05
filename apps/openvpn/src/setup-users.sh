#!/usr/bin/env bash

set -o allexport
source /.secrets/users.env
set +o allexport

IFS=, read -a usernamesArray <<<"$usernames"
IFS=, read -a passwordsArray <<<"$passwords"

echo "Revoking all clients in order to perform reset."
pushd
read -a clientsToRevoke <<<"$(tail -n +2 /etc/openvpn/easy-rsa/pki/index.txt | grep "^V" | cut -d '=' -f 2)"
cd /etc/openvpn/easy-rsa/ || return
for i in "${!clientsToRevoke[@]}"; do
    CLIENT="${clientsToRevoke[i]}"
    ./easyrsa --batch revoke "$CLIENT"
    EASYRSA_CRL_DAYS=3650 ./easyrsa gen-crl
    rm -f /etc/openvpn/crl.pem
    cp /etc/openvpn/easy-rsa/pki/crl.pem /etc/openvpn/crl.pem
    chmod 644 /etc/openvpn/crl.pem
    find /home/ -maxdepth 2 -name "$CLIENT.ovpn" -delete
    rm -f "/root/$CLIENT.ovpn"
    sed -i "/^$CLIENT,.*/d" /etc/openvpn/ipp.txt
    cp /etc/openvpn/easy-rsa/pki/index.txt{,.bk}
    echo ""
    echo "Certificate for client $CLIENT revoked."
done
popd

echo "Creating all clients."
export MENU_OPTION="1"
export PASS="2"
for i in "${!usernamesArray[@]}"; do
    [ -z $usernamesArray[i] ] && exit "Username is required. There exists more passwords than usernames."
    [ -z $passwordsArray[i] ] && exit "Password is required. There exists more usernames than passwords."
    CLIENT="${usernamesArray[i]}" CLIENT_PASS="${passwordsArray[i]}" /openvpn-install.sh

    echo "
auth-user-pass
push-peer-info
route 10.0.0.0 255.0.0.0" >>"/root/${usernamesArray[i]}.ovpn"
done
