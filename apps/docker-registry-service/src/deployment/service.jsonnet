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

local nodePort = { name: "docker-registry-node-port", port: 5000, targetPort: 5000 } +
                 k.core.v1.servicePort.withNodePort(30500)
;
local nodePortService = k.core.v1.service.new("docker-registry-node-port", {
                        }, [nodePort]) +
                        k.core.v1.service.spec.withType("NodePort",)
;

[]
+ [service, endpoint]
+ [nodePortService]
