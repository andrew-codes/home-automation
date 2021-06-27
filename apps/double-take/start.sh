#!/usr/bin/env bash

envsubst </double-take/config.yml >/double-take/config.yml
nodemon --watch config.yml api/server.js
