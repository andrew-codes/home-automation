local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new('game-library-db', std.extVar('image'), '', std.extVar('dbPort'), '27017')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'MONGO_INITDB_ROOT_USERNAME', value: std.extVar('dbUsername') },
                     { name: 'MONGO_INITDB_ROOT_PASSWORD', value: std.extVar('dbPassword') },
                   ])
                   + lib.deployment.withPersistentVolume('game-library-db')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('game-library-db', '/data/db',));

local gameLibraryDbVolume = lib.volume.persistentVolume.new('game-library-db', '60Gi', '/mnt/data/game-library-db');

gameLibraryDbVolume + std.objectValues(deployment)