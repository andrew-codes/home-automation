local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new('guest-db', std.extVar('image'), '', '', '27017')
                   + lib.deployment.withPersistentVolume('guest-db')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('guest-db', '/data/db',));

local gameLibraryDbVolume = lib.volume.persistentVolume.new('guest-db', '5Gi');

std.objectValues(deployment) + gameLibraryDbVolume
