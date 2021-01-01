#!/usr/bin/env bash

source ../../scripts/bin/start-locally.sh

echo "No local port, chech logs instead..."
start-locally home-automation guest-wifi-renewal node-app:latest
