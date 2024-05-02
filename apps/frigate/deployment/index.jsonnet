local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local mediaVolume = [
  k.core.v1.persistentVolume.new('frigate-media')
  + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolume.spec.withStorageClassName('nfs')
  + k.core.v1.persistentVolume.spec.withCapacity({ storage: '300Gi' })
  + k.core.v1.persistentVolume.spec.nfs.withPath('/volume1/k8s-data/frigate-media')
  + k.core.v1.persistentVolume.spec.nfs.withServer(std.extVar('nfsIp'))
  + k.core.v1.persistentVolume.spec.nfs.withReadOnly(false)
  + k.core.v1.persistentVolume.spec.withMountOptions(['nfsvers=4.1'])
  + k.core.v1.persistentVolume.spec.withVolumeMode('Filesystem')
  + k.core.v1.persistentVolume.spec.withPersistentVolumeReclaimPolicy('Recycle'),

  k.core.v1.persistentVolumeClaim.new('frigate-media')
  + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('nfs')
  + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '300Gi' }),
]
;
local configVolume = [
  k.core.v1.persistentVolume.new('frigate-config')
  + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolume.spec.withStorageClassName('nfs')
  + k.core.v1.persistentVolume.spec.withCapacity({ storage: '10Gi' })
  + k.core.v1.persistentVolume.spec.nfs.withPath('/volume1/k8s-data/frigate-config')
  + k.core.v1.persistentVolume.spec.nfs.withServer(std.extVar('nfsIp'))
  + k.core.v1.persistentVolume.spec.nfs.withReadOnly(false)
  + k.core.v1.persistentVolume.spec.withMountOptions(['nfsvers=4.1'])
  + k.core.v1.persistentVolume.spec.withVolumeMode('Filesystem')
  + k.core.v1.persistentVolume.spec.withPersistentVolumeReclaimPolicy('Recycle'),

  k.core.v1.persistentVolumeClaim.new('frigate-config')
  + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('nfs')
  + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '10Gi' }),
]
;

mediaVolume + configVolume
