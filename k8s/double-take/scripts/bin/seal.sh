#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

cat >.secrets/config-secrets.yaml <<EOL
mqtt:
  host: mqtt
  username: $MQTT_USERNAME
  password: $MQTT_PASSWORD
  topics:
    frigate: frigate/events
    matches: double-take/matches
    cameras: double-take/cameras

confidence:
  match: 60
  unknown: 40

objects:
  face:
    min_area_match: 10000

save:
  matches: true
  unknown: true

purge:
  matches: 168
  unknown: 8

frigate:
  url: http://frigate:5000
  image:
    height: 500
  attempts:
    latest: 10
    snapshot: 0
  cameras:
    - front_door
    - car_port_door

detectors:
  facebox:
    url: http://facebox:8080

time:
  format: F
  timezone: America/New_York
EOL

kubectl create secret generic double-take-secrets --dry-run=client --namespace="home-automation" --from-file=yml=".secrets/double-take-secrets.yaml" -o json >".secrets/double-take-secrets.json"
kubeseal --namespace "home-automation" <".secrets/double-take-secrets.json" >"secrets/double-take-secrets.json"
rm -rf .secrets/double-take-secrets.json
rm -rf .secrets/double-take-secrets.yaml

