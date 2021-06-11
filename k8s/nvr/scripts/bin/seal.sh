#!/usr/bin/env bash

source ../../secrets.sh
source ../../external-port-vars.sh

mkdir -p secrets
mkdir -p .secrets

# Frigate Config Secrets
cat >.secrets/config-secrets.yaml <<EOL
mqtt:
  # Required: host name
  host: $CLUSTER_IP
  # Optional: port (default: shown below)
  port: $EXTERNAL_MQTT_PORT
  # Optional: topic prefix (default: shown below)
  # WARNING: must be unique if you are running multiple instances
  topic_prefix: frigate
  # Optional: client id (default: shown below)
  # WARNING: must be unique if you are running multiple instances
  client_id: frigate
  # Optional: user
  user: $MQTT_USERNAME
  # Optional: password
  # NOTE: Environment variables that begin with 'FRIGATE_' may be referenced in {}.
  #       eg. password: '{FRIGATE_MQTT_PASSWORD}'
  password: $MQTT_PASSWORD
  # Optional: interval in seconds for publishing stats (default: shown below)
  stats_interval: 60

ffmpeg:
  output_args:
    detect: -f rawvideo

objects:
  track:
    - person
    - car
  filters:
    person:
      # Optional: minimum width*height of the bounding box for the detected object (default: 0)
      min_area: 5000
      # Optional: maximum width*height of the bounding box for the detected object (default: 24000000)
      max_area: 100000
      # Optional: minimum score for the object to initiate tracking (default: shown below)
      min_score: 0.5
      # Optional: minimum decimal percentage for tracked object's computed score to be considered a true positive (default: shown below)
      threshold: 0.7

record:
  enabled: True
  retain_days: 30

detectors:
  cpu1:
    type: cpu
  cpu2:
    type: cpu

logger:
  default: debug
  logs:
    frigate.mqtt: error

# snapshots:
#   # Optional: Enable writing jpg snapshot to /media/frigate/clips (default: shown below)
#   # This value can be set via MQTT and will be updated in startup based on retained value
#   enabled: True
#   # Optional: print a timestamp on the snapshots (default: shown below)
#   timestamp: False
#   # Optional: draw bounding box on the snapshots (default: shown below)
#   bounding_box: False
#   # Optional: crop the snapshot (default: shown below)
#   crop: False
#   # Optional: height to resize the snapshot to (default: original size)
#   # Optional: Restrict snapshots to objects that entered any of the listed zones (default: no required zones)
#   # Optional: Camera override for retention settings (default: global values)
#   retain:
#     # Required: Default retention days (default: shown below)
#     default: 10
#     # Optional: Per object retention days
#     objects:
#       person: 15

# rtmp:
#   # Required: Enable the live stream (default: True)
#   enabled: True

cameras:
  front_door:
    ffmpeg:
      inputs:
        - path: $FRONT_DOOR_RTSP
          roles:
            - detect
        - path: $FRONT_DOOR_RTSP
          roles:
            - clips
            - rtmp
            - record
    width: 1600
    height: 1200
    fps: 5

  car_port_door:
    ffmpeg:
      inputs:
        - path: $CAR_PORT_RTSP
          roles:
            - detect
        - path: $CAR_PORT_RTSP
          roles:
            - clips
            - rtmp
            - record
    width: 1600
    height: 1200
    fps: 5
EOL

kubectl create secret generic config-secrets --dry-run=client --namespace="home-automation" --from-file=yml=".secrets/config-secrets.yaml" -o json >".secrets/config-secrets.json"
kubeseal --namespace "home-automation" <".secrets/config-secrets.json" >"secrets/config-secrets.json"
rm -rf .secrets/config-secrets.json
rm -rf .secrets/config-secrets.yaml

echo "$FRIGATE_RTSP_PASSWORD" >.secrets/rtsp-password
kubectl create secret generic nvr-secrets --dry-run=client --namespace="home-automation" --from-file=rtsp-password=".secrets/rtsp-password" -o json >".secrets/rtp-password.json"
kubeseal --namespace "home-automation" <".secrets/rtp-password.json" >"secrets/rtp-password.json"
rm -rf .secrets/rtp-password
rm -rf .secrets/rtp-password.json
