#!/usr/bin/env bash

mkdir -p /.storage/config
envsubst </config.yml >/.storage/config/config.yml
nodemon --watch api/server.js
