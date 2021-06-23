#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv write cubbyhole/frigate \
  front-door-rtsp="" \
  car-port-rtsp=""
