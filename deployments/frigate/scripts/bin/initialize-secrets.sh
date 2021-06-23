#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put cubbyhole/frigate \
  front-door-rtsp="" \
  car-port-rtsp=""
