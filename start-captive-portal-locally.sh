#!/usr/bin/env bash

source scripts/bin/start-locally.sh

echo "Will Start on Port 8081"
start-locally home-automation captive-portal node-app:latest 8081
