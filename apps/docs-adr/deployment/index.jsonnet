local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";

local deployment = lib.deployment.new(std.extVar("name"), std.extVar("image"), std.extVar("secrets"), "", "80")
;

[]
+ std.objectValues(deployment)
