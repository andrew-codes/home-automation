local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local assetVolume = lib.volume.persistentNfsVolume.new(std.extVar('name') + '-assets', '40Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '3000')
                  + lib.deployment.withPersistentVolume(std.extVar('name') + '-assets')
                  + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new(std.extVar('name') + '-assets', '/opt/playnite-web-app/public/assets/asset-by-id',))
                  + lib.deployment.withEnvVars(0, [
                    { name: 'DB_HOST', value: 'game-library-db' },
                    { name: 'DEBUG', value: 'playnite*' },
                    { name: 'MQTT_HOST', value: 'mqtt' },
                    { name: 'MQTT_PORT', value: '1883' },
                    { name: 'USERNAME', value: std.extVar('username') },
                    { name: 'PASSWORD', value: std.extVar('password') },
                    { name: 'SECRET', value: std.extVar('secret') },
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
+ assetVolume
+ std.objectValues(deployment)
