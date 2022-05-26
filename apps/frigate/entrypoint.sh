#!/usr/bin/env sh

envsubst </config/config-raw.yml >/config/config.yml
/init &
python3 -u -m frigate
