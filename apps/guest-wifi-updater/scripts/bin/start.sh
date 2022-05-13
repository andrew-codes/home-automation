#!/usr/bin/env bash

telepresence connect
nodemon src/index.ts --inspect=0.0.0.0:9233
