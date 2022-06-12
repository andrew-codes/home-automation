local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'))
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                   ])
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('double-take', '/.storage',))
                   + lib.deployment.withPersistentVolume('double-take');

local volume = lib.volume.persistentVolume.new('double-take', '60Gi', '/mnt/data/double-take');

volume + std.objectValues(deployment)
