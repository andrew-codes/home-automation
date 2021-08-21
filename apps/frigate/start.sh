#!/usr/bin/env sh

envsubst </config/config-raw.yml >/config/config.yml
/run.sh
