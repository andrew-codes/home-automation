local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local db = lib.deployment.new(std.extVar('name') + '-db', 'mongo:focal', '', '', '27017')
           + lib.deployment.withPersistentVolume(std.extVar('name') + '-db')
           + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new(std.extVar('name') + '-db', '/data/db',))
           + lib.deployment.withAffinity({
             nodeAffinity: {
               requiredDuringSchedulingIgnoredDuringExecution: {
                 nodeSelectorTerms: [
                   { matchExpressions: [{ key: 'kubernetes.io/hostname', operator: 'In', values: ['k8s-main'] }] },
                 ],
               },
             },
           },)
;

local dbVolumes = [
  k.core.v1.persistentVolume.new(std.extVar('name') + '-db-pv')
  + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
  + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolume.spec.withCapacity({ storage: '60Gi' })
  + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/' + std.extVar('name') + '-db'),

  k.core.v1.persistentVolumeClaim.new(std.extVar('name') + '-db-pvc')
  + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '60Gi' }),
]
;

local assetVolume = lib.volume.persistentNfsVolume.new(std.extVar('name') + '-assets', '40Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '3000')
                   + lib.deployment.withPersistentVolume(std.extVar('name') + '-assets')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new(std.extVar('name') + '-assets', '/opt/playnite-web-app/public/assets/asset-by-id',))
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DB_HOST', value: std.extVar('name') + '-db' },
                     { name: 'DEBUG', value: 'playnite*' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                     { name: 'USERNAME', value: std.extVar('username') },
                     { name: 'PASSWORD', value: std.extVar('password') },
                     { name: 'SECRET', value: std.extVar('secret') },
                     { name: 'CSP_ORIGINS', value: '*.cloudflareinsights.com,*.smith-simms.family' },
                     { name: 'HOST', value: std.extVar('host') },
                   ])
                   + lib.deployment.withProbe(0, '/')
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [{ key: 'kubernetes.io/hostname', operator: 'In', values: ['k8s-node-3'] }] },
                         ],
                       },
                     },
                   },)
;


[]
+ dbVolumes
+ std.objectValues(db)
+ assetVolume
+ std.objectValues(deployment)
