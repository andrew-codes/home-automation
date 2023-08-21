local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local mosquittoConfigMap = {
  'mosquitto.conf': '\nallow_anonymous true\nallow_duplicate_messages false\nlistener 1883\n\nlistener 9001\nprotocol websockets\n\npersistence true\npersistence_location /mosquitto/data/\nlog_dest file /mosquitto/log/mosquitto.log\n  ',
};

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '1883')
                   + lib.deployment.withPort(0, std.extVar('name'), 'web-socket', 9001)
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [{ key: 'beta.kubernetes.io/arch', operator: 'In', values: ['amd64'] }] },
                         ],
                       },
                     },
                   },)
                   + lib.deployment.withContainerAugmentation(0, { command: ['sh'], args: ['-c', 'echo -n "$MQTT_USERNAME:$MQTT_PASSWORD" > /mosquitto/passwd && /usr/sbin/mosquitto -c /mosquitto/config/mosquitto.conf'] })
                   + lib.deployment.withConfigMapVolume('mosquitto-config')
                   + lib.deployment.withPersistentVolume('mosquitto')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('mosquitto', '/mosquitto/data',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('mosquitto-config', '/mosquitto/config/mosquitto.conf') + k.core.v1.volumeMount.withSubPath('mosquitto.conf'));

local configMap = lib.volume.configMapVolume.new('mosquitto-config', mosquittoConfigMap);
local pvc = lib.volume.persistentVolume.new('mosquitto', '5Gi');

pvc + configMap + std.objectValues(deployment)
