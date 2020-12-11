#!/usr/bin/env bash

source secrets.sh

# Make sure that the .ssh directory exists in your server's home folder
ssh "$GAMING_PC_USERNAME@$1" mkdir "C:\users\$GAMING_PC_USERNAME\.ssh"
# Use scp to copy the public key file generated previously to authorized_keys on your server
mkdir -p .secrets
curl "https://github.com/$GITHUB_USERNAME.keys" >.secrets/authorized_keys
scp .secrets/authorized_keys "$GAMING_PC_USERNAME@$1:C:\\Users\\$GAMING_PC_USERNAME\\.ssh\\authorized_keys"

# Appropriately ACL the authorized_keys file on your server
ssh $GAMING_PC_USERNAME@$1 powershell -c "$ConfirmPreference = 'None'"
ssh $GAMING_PC_USERNAME@$1 powershell -c "Repair-AuthorizedKeyPermission C:\\Users\\$GAMING_PC_USERNAME\\.ssh\\authorized_keys"

rm -f .secrets/authorized_keys
