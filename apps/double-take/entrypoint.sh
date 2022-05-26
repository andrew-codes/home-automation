#!/usr/bin/env bash

mkdir -p /.storage/config
envsubst </config.yml >/.storage/config/config.yml
nodemon --watch /.storage/config/config.yml api/server.js
