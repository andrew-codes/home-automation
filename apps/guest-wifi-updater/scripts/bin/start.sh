#!/usr/bin/env bash

echo "Will Start on http://localhost:8080"

telepresence connect

telepresence intercept "guest-wifi-updater" --service guest-wifi-updater --env-file intercept.env --port 8080:80 -- /bin/bash -c 'nodemon src/index.ts --inspect=0.0.0.0:9233'
