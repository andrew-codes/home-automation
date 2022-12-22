local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '80')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'NODE_TLS_REJECT_UNAUTHORIZED', value: '0' },
                     { name: 'DB_HOST', value: 'game-library-db' },
                   ])
                   + lib.deployment.withPersistentVolume('game-assets')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('game-assets', '/assets',));

std.objectValues(deployment)
