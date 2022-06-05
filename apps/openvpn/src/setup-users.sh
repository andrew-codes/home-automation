#!/usr/bin/env bash

set -o allexport
source /.secrets/users.env
set +o allexport

IFS=, read -a usernamesArray <<<"$usernames"
IFS=, read -a passwordsArray <<<"$passwords"

export MENU_OPTION="1"
export PASS="2"
for i in "${!usernamesArray[@]}"; do
    [ -z $usernamesArray[i] ] && exit "Username is required. There exists more passwords than usernames."
    [ -z $passwordsArray[i] ] && exit "Password is required. There exists more usernames than passwords."
    CLIENT="${usernamesArray[i]}" CLIENT_PASS="${passwordsArray[i]}" /openvpn-install.sh
done

touch /setup-users.log
