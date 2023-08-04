local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', '')
                   + lib.deployment.withHostNetwork()
                   + lib.deployment.withPort(0, std.extVar('name'), 'port1', 139, '')
                   + lib.deployment.withPort(0, std.extVar('name'), 'port2', 445, '')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'SHARE1', value: 'paperless;/mnt/data/paperless-consume;yes;no;no;smith-simms' },
                     k.core.v1.envVar.fromSecretRef('USER1', 'samba-user-1', 'secret-value'),
                   ])
                   + lib.deployment.withPersistentVolume('paperless-consume')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('paperless-consume', '/mnt/data/paperless-consume',))
;

std.objectValues(deployment)
