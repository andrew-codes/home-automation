#!/usr/bin/env bash

envsubst <home-assistant.yml | kubectl apply -f -
