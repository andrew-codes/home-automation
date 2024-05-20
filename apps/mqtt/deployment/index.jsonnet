local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local mosquittoConfigMap = {
  'mosquitto.conf': '\nallow_anonymous false\nlistener 1883\n\nlistener 9001\nprotocol websockets\n\npersistence true\npersistence_location /mosquitto/data\nlog_dest file /mosquitto/log/mosquitto.log\npassword_file /mosquitto/passwd\nuser root\n',
};

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '1883')
                   + lib.deployment.withPort(0, std.extVar('name'), 'web-socket', 9001)
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [
                             { key: 'beta.kubernetes.io/arch', operator: 'In', values: ['amd64'] },
                           ] },
                         ],
                       },
                     },
                   },)
                   + lib.deployment.withContainerAugmentation(0, { command: ['sh'], args: ['-c', 'echo "$MQTT_USERNAME:$MQTT_PASSWORD" > /mosquitto/passwd && mosquitto_passwd -U /mosquitto/passwd && /usr/sbin/mosquitto -c /mosquitto/config/mosquitto.conf'] })
                   + lib.deployment.withConfigMapVolume('mosquitto-config')
                   + lib.deployment.withPersistentVolume('mqtt-data')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('mqtt-data', '/mosquitto/data',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('mosquitto-config', '/mosquitto/config/mosquitto.conf') + k.core.v1.volumeMount.withSubPath('mosquitto.conf'))
                   + lib.deployment.withSecurityContext(0, k.core.v1.securityContext.withRunAsUser(0))
;

local configMap = lib.volume.configMapVolume.new('mosquitto-config', mosquittoConfigMap)
;
local mqttData = lib.volume.persistentNfsVolume.new('mqtt-data', '5Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;

mqttData + configMap + std.objectValues(deployment)
