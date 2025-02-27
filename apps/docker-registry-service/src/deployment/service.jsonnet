local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local service = k.core.v1.service.new("docker-registry", {}, [
  { name: "registry", port: 5000, protocol: "TCP", targetPort: 5000 },
])
;
local endpoint = k.core.v1.endpoints.new("docker-registry")
                 + k.core.v1.endpoints.withSubsets([
                   {
                     addresses: [
                       { ip: std.extVar("ip") },
                     ],
                     ports: [
                       { name: "registry", port: 5000, protocol: "TCP" },
                     ],
                   },
                 ])
;

[service, endpoint]
