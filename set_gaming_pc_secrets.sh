#!/usr/bin/env bash

source secrets.sh

mkdir -p ansible/windows/.secrets
cat >ansible/windows/.secrets/gaming_pc.yml <<EOL
---
gaming_room_gaming_pc_username: "$GAMING_ROOM_GAMING_PC_USERNAME"
EOL

cat >ansible/windows/.secrets/home-automation-ssh <<EOL
$HOME_AUTOMATION_SSH_PRIVATE_KEY
EOL
chmod 0600 ansible/windows/.secrets/home-automation-ssh
cat >ansible/windows/.secrets/home-automation-ssh.pub <<EOL
$HOME_AUTOMATION_SSH_PUBLIC_KEY
EOL
chmod 0600 ansible/windows/.secrets/home-automation-ssh.pub
