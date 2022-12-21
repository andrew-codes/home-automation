local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', '80')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'NODE_TLS_REJECT_UNAUTHORIZED', value: '0' },
                     { name: 'DB_HOST', value: 'game-library-db' },
                   ]);

local service = k.core.v1.service.new(std.extVar('name'), { name: std.extVar('name') }, [{
  name: 'http',
  port: 80,
  protocol: 'TCP',
  targetPort: 'http',
}],);

std.objectValues(deployment) + [service]
