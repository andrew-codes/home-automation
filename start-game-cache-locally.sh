#!/usr/bin/env bash

source scripts/bin/start-locally.sh

echo "No local port, chech logs instead..."
start-locally home-automation game-cache node-app:latest
