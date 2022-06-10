local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

local mosquittoConfigMap = {
  'mosquitto.conf': '\nallow_anonymous false\npassword_file /mosquitto/passwd\nallow_duplicate_messages false\nlistener 1883\n\nlistener 9001\nprotocol websockets\n\npersistence true\npersistence_location /mosquitto/data/\nlog_dest file /mosquitto/log/mosquitto.log\n  ',
};

lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), 1883)
+ lib.deployment.withPort(0, 'web-socket', 9001)
+ lib.deployment.withAffinity({
  nodeAffinity: {
    requiredDuringSchedulingIgnoredDuringExecution: {
      nodeSelectorTerms: [
        { matchExpressions: [{ key: 'beta.kubernetes.io/arch', operator: 'In', values: ['amd64'] }] },
      ],
    },
  },
},)
+ lib.deployment.withContainerAugmentation(0, { command: 'sh', args: ['-c', 'echo -n "$USERNAME:$PASSWORD" > /mosquitto/passwd && mosquitto_passwd -U /mosquitto/passwd && /usr/sbin/mosquitto -c /mosquitto/config/mosquitto.conf'] })
+ lib.deployment.withConfigMapVolume('mosquitto-config', mosquittoConfigMap)
+ lib.deployment.withPersistentVolume('mosquitto', '15Gi', '/mnt/data/mosquitto')
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('mosquitto', '/mosquitto/data',))
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('mosquitto-config', '/mosquitto/config/mosquitto.conf') + k.core.v1.volumeMount.withSubPath('mosquitto.conf'))
