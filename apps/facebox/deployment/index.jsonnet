local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', '8080')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'MB_KEY', value: std.extVar('mbKey') },
                   ]);

std.objectValues(deployment)
