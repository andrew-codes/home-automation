#!/usr/bin/env bash

source ../../secrets.sh
source ../../external-port-vars.sh

mkdir -p secrets
mkdir -p .secrets

# Frigate Config Secrets
cat >.secrets/config-secrets.yaml <<EOL
mqtt:
  host: $CLUSTER_IP
  port: $EXTERNAL_MQTT_PORT
  topic_prefix: frigate
  client_id: frigate
  user: $MQTT_USERNAME
  password: $MQTT_PASSWORD
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
  retain_days: 7

detectors:
  cpu1:
    type: cpu
  cpu2:
    type: cpu

logger:
  default: debug
  logs:
    frigate.mqtt: error

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
    motion:
      mask:
        - 0,702,321,643,422,642,348,917,0,1127
        - 0,0,627,0,774,298,667,302,596,378,601,573,286,592,0,577
        - 859,422,979,458,1123,580,995,897,1104,1200,1600,1200,1600,0,540,0
    objects:
      filters:
        car:
          mask:
            - 0,0,1600,0,1600,1200,609,280,866,629,1109,625,1131,578,0,575
        person:
          mask:
            - 1600,1200,1022,1200,995,936,1186,764,1600,757
            - 1600,0,1600,500,1416,501,1018,374,609,280,0,475,0,0
    snapshots:
      # Optional: Enable writing jpg snapshot to /media/frigate/clips (default: shown below)
      # This value can be set via MQTT and will be updated in startup based on retained value
      enabled: True
      # Optional: print a timestamp on the snapshots (default: shown below)
      timestamp: True
      # Optional: draw bounding box on the snapshots (default: shown below)
      bounding_box: True
      # Optional: crop the snapshot (default: shown below)
      crop: False
      # Optional: height to resize the snapshot to (default: original size)
      # Optional: Restrict snapshots to objects that entered any of the listed zones (default: no required zones)
      # Optional: Camera override for retention settings (default: global values)
      retain:
        # Required: Default retention days (default: shown below)
        default: 10
        # Optional: Per object retention days
        objects:
          person: 15
    rtmp:
      enabled: True

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
    motion:
      mask:
        - 0,1200,116,1200,531,881,512,396,0,88
        - 833,664,953,658,943,601,857,598
    objects:
      filters:
        car:
          mask:
            - 598,880,597,1018,1057,1200,572,1200,0,1200,0,630,764,700
            - 1600,0,0,0,0,643,290,0,798,521,1089,536,1063,1200,1600,1200
        person:
          mask:
            - 1600,1200,1600,0,1024,0,1089,424,1061,1200
            - 290,0,330,502,170,614,0,584,0,0
    snapshots:
      # Optional: Enable writing jpg snapshot to /media/frigate/clips (default: shown below)
      # This value can be set via MQTT and will be updated in startup based on retained value
      enabled: True
      # Optional: print a timestamp on the snapshots (default: shown below)
      timestamp: True
      # Optional: draw bounding box on the snapshots (default: shown below)
      bounding_box: True
      # Optional: crop the snapshot (default: shown below)
      crop: False
      # Optional: height to resize the snapshot to (default: original size)
      # Optional: Restrict snapshots to objects that entered any of the listed zones (default: no required zones)
      # Optional: Camera override for retention settings (default: global values)
      retain:
        # Required: Default retention days (default: shown below)
        default: 10
        # Optional: Per object retention days
        objects:
          person: 15
    rtmp:
      enabled: True
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
