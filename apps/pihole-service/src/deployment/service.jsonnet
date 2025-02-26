local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local pihole1Service = k.core.v1.service.new('pihole1', {}, [
  { name: 'pihole1', port: 80, protocol: 'TCP', targetPort: 80 },
])
;
local pihole1Endpoint = k.core.v1.endpoints.new('pihole1')
                        + k.core.v1.endpoints.withSubsets([
                          {
                            addresses: [
                              { ip: std.extVar('ip1') },
                            ],
                            ports: [
                              { name: 'pihole1', port: 80, protocol: 'TCP' },
                            ],
                          },
                        ])
;

local pihole2Service = k.core.v1.service.new('pihole2', {}, [
  { name: 'pihole2', port: 80, protocol: 'TCP', targetPort: 80 },
])
;
local pihole2Endpoint = k.core.v1.endpoints.new('pihole2')
                        + k.core.v1.endpoints.withSubsets([
                          {
                            addresses: [
                              { ip: std.extVar('ip2') },
                            ],
                            ports: [
                              { name: 'pihole2', port: 80, protocol: 'TCP' },
                            ],
                          },
                        ])
;

[]
+ [pihole1Service, pihole1Endpoint]
+ [pihole2Service, pihole2Endpoint]
