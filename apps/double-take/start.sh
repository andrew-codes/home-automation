#!/usr/bin/env bash

mkdir -p /double-take/.storage/config
envsubst </config.yml >/double-take/.storage/config/config.yml
nodemon --watch config.yml api/server.js
