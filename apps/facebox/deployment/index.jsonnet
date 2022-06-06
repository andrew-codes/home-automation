local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', 8080)
