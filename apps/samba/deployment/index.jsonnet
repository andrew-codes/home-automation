local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', '')
                   + lib.deployment.withHostNetwork()
                   + lib.deployment.withPort(0, std.extVar('name'), 'port1', 139, '')
                   + lib.deployment.withPort(0, std.extVar('name'), 'port2', 445, '')
                   + {
                     deployment+: {
                       spec+: {
                         template+: {
                           spec+: {
                             securityContext+: {
                               fsGroup: 1000,
                             },
                           },
                         },
                       },
                     },
                   }
                   + lib.deployment.withEnvVars(0, [
                     { name: 'USERID', value: '1000' },
                     { name: 'GROUPID', value: '1000' },
                     { name: 'SHARE1', value: 'paperless;/mnt/data/paperless-consume;yes;no;no;smith-simms;smith-simms;smith-simms' },
                     { name: 'SHARE2', value: 'photos-import;/mnt/data/photos-import;yes;no;no;smith-simms;smith-simms;smith-simms' },
                     k.core.v1.envVar.fromSecretRef('USER1', 'samba-user-1', 'secret-value'),
                   ])
                              + lib.deployment.withPersistentVolume('photoprism-import')
                                + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('photoprism-import', '/mnt/data/photos-import',))
                   + lib.deployment.withPersistentVolume('paperless-consume')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('paperless-consume', '/mnt/data/paperless-consume',))
;

std.objectValues(deployment)
