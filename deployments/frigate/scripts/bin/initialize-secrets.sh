#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/frigate \
  FRONT_DOOR_RTSP="" \
  CAR_PORT_DOOR_RTSP=""
