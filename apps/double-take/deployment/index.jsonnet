local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

lib.deployment.newWithExternalPort(std.extVar('name'), std.extVar('image'), std.extVar('port'), std.extVar('secrets')) + lib.deployment.withEnvVars(0, [
  { name: 'DEBUG', value: '' },
  { name: 'MQTT_HOST', value: 'mqtt' },
  { name: 'MQTT_PORT', value: '1883' },
])
+ lib.deployment.withPersistentVolume('double-take', '60Gi', '/mnt/data/double-take')
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('data-store', '/.storage',))
