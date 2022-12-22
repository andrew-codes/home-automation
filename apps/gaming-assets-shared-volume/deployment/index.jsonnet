local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

local assetLibraryDbVolume = lib.volume.persistentVolume.new('game-assets', '100Gi', '/mnt/data/game-assets');

[assetLibraryDbVolume]
