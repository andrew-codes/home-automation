local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '80')
                   + lib.deployment.withContainerAugmentation(0, { args: ['--config /dist/config.yaml --supergraph /dist/schema.graphql'] })
;

std.objectValues(deployment)
