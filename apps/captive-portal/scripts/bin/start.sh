#!/usr/bin/env bash

source ../../scripts/bin/start-locally.sh

echo "Will Start on Port 8081"
start-locally default captive-portal node-app:latest 8081
