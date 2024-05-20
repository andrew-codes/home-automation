{ spec: { template: { spec: { containers: [{
  name: 'frigate',
  env: [
    {
      name: 'FRIGATE_MQTT_USERNAME',
      valueFrom: {
        secretKeyRef: { name: 'mqtt-username', key: 'secret-value' },
      },
    },
    {
      name: 'FRIGATE_MQTT_PASSWORD',
      valueFrom: {
        secretKeyRef: { name: 'mqtt-password', key: 'secret-value' },
      },
    },
  ],
}] } } } }
