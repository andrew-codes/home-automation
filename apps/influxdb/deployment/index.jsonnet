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
                   + lib.deployment.withPersistentVolume('influxdb')
                   + lib.deployment.withPersistentVolume('influxdb-config')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('influxdb', '/var/lib/influxdb2',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('influxdb-config', '/etc/influxdb2',));

local dataPvc = [
  k.core.v1.persistentVolume.new('influxdb-pv')
  + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
  + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolume.spec.withCapacity({ storage: '150Gi' })
  + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/influxdb'),

  k.core.v1.persistentVolumeClaim.new('influxdb-pvc')
  + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '150Gi' }),
]
;
local configPvc = [
  k.core.v1.persistentVolume.new('influxdb-config-pv')
  + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
  + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolume.spec.withCapacity({ storage: '30Gi' })
  + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/influxdb-config'),

  k.core.v1.persistentVolumeClaim.new('influxdb-config-pvc')
  + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '30Gi' }),
]
;

dataPvc + configPvc + std.objectValues(deployment)
