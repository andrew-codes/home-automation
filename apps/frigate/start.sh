#!/usr/bin/env bash

envsubst </config/config.yml >/config/config.yml
/run.sh
