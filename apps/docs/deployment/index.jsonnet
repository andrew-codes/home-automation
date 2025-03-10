local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";

local deployment = lib.deployment.new(std.extVar("name"), std.extVar("image"), [], "", "80", true)
                   + lib.deployment.withProbe(0, "/health", "http")
;

[]
+ std.objectValues(deployment)
