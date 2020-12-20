#!/usr/bin/env bash

source scripts/bin/start-locally.sh

echo "Will Start on Port 8080"
start-locally home-automation graphql-api 8080
