local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local proxmoxService = k.core.v1.service.new("proxmox", {}, [
  { name: "proxmox", port: 8006, protocol: "TCP", targetPort: 8006 },
])
;
local proxmoxEndpoint = k.core.v1.endpoints.new("proxmox")
                        + k.core.v1.endpoints.withSubsets([
                          {
                            addresses: [
                              { ip: std.extVar("proxmoxIp") },
                            ],
                            ports: [
                              { name: "proxmox", port: 8006, protocol: "TCP" },
                            ],
                          },
                        ])
;

local nasService = k.core.v1.service.new("nas", {}, [
  { name: "nas", port: 5000, protocol: "TCP", targetPort: 5000 },
])
;
local nasEndpoint = k.core.v1.endpoints.new("nas")
                    + k.core.v1.endpoints.withSubsets([
                      {
                        addresses: [
                          { ip: "10.5.113.53" },
                        ],
                        ports: [
                          { name: "nas", port: 5000, protocol: "TCP" },
                        ],
                      },
                    ])
;

[]
+ [proxmoxService, proxmoxEndpoint]
+ [nasService, nasEndpoint]
