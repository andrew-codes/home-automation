#!/usr/bin/env bash

telepresence connect

telepresence intercept "ps5" --service ps5 --env-file intercept.env --port 8080:8080 -- /bin/bash -c 'DEBUG=@ha/* nodemon src/index.ts --inspect=0.0.0.0:9233'
