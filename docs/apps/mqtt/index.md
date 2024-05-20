# MQTT

## Cluster Containers Connection Information

When connecting to MQTT from other containers in the cluster, use the following connection information:

```yml
host: mqtt
port: 1883
username: $MQTT_USERNAME
password: $MQTT_PASSWORD
```

## External Application Connection Information

When connecting to MQTT from services running outside the cluster, use the following connection information:

```yml
host: $CLUSTER_IP
port: $EXTERNAL_MQTT_PORT # found in the external-port-vars.sh file.
username: $MQTT_USERNAME
password: $MQTT_PASSWORD
```
