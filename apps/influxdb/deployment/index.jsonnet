local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), 8086) + lib.deployment.withEnvVars(0, [
  { name: 'DOCKER_INFLUXDB_INIT_MODE', value: 'setup' },
  { name: 'DOCKER_INFLUXDB_INIT_USERNAME', value: std.extVar('DOCKER_INFLUXDB_INIT_USERNAME') },
  { name: 'DOCKER_INFLUXDB_INIT_PASSWORD', value: std.extVar('DOCKER_INFLUXDB_INIT_PASSWORD') },
  { name: 'DOCKER_INFLUXDB_INIT_ORG', value: std.extVar('DOCKER_INFLUXDB_INIT_ORG') },
  { name: 'DOCKER_INFLUXDB_INIT_BUCKET', value: std.extVar('DOCKER_INFLUXDB_INIT_BUCKET') },
])
+ lib.deployment.withPersistentVolume('influxdb', '150Gi', '/mnt/data/influxdb')
+ lib.deployment.withPersistentVolume('influxdb-config', '30Gi', '/mnt/data/influxdb-config')
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('influxdb', '/var/lib/influxdb2',))
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('influxdb-config', '/etc/influxdb2',))