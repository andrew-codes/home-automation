#!/usr/bin/env sh

cat /root/.config/playactor/credentials.json
node -r tsconfig-paths/register dist/apps/ps5/src/index.js
