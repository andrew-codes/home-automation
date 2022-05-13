#!/usr/bin/env bash

telepresence connect

telepresence intercept "guest-wifi-updater" --service guest-wifi-updater --env-file intercept.env --port 8080:80 -- /bin/bash -c 'DEBUG=@ha/* nodemon src/index.ts --inspect=0.0.0.0:9233'
