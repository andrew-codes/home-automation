local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '8086')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DOCKER_INFLUXDB_INIT_MODE', value: 'setup' },
                     { name: 'DOCKER_INFLUXDB_INIT_USERNAME', value: std.extVar('DOCKER_INFLUXDB_INIT_USERNAME') },
                     { name: 'DOCKER_INFLUXDB_INIT_PASSWORD', value: std.extVar('DOCKER_INFLUXDB_INIT_PASSWORD') },
                     { name: 'DOCKER_INFLUXDB_INIT_ORG', value: std.extVar('DOCKER_INFLUXDB_INIT_ORG') },
                     { name: 'DOCKER_INFLUXDB_INIT_BUCKET', value: std.extVar('DOCKER_INFLUXDB_INIT_BUCKET') },
                   ])
                   + lib.deployment.withPersistentVolume('influxdb-data')
                   + lib.deployment.withPersistentVolume('influxdb-config')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('influxdb-data', '/var/lib/influxdb2',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('influxdb-config', '/etc/influxdb2',))
;

local dataVolume = lib.volume.persistentNfsVolume.new('influxdb-data', '150Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local configVolume = lib.volume.persistentNfsVolume.new('influxdb-config', '30Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local telegrafConfigVolume = lib.volume.persistentVolume.new('telegraf-config', '10Gi')
;

dataVolume + configVolume + std.objectValues(deployment) + telegrafConfigVolume
