local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local configMap = k.core.v1.configMap.new("cloudflared", {
  "config.yaml": std.extVar("config"),
});

local deployment = k.apps.v1.deployment.new("cloudflared", containers=[{
                     name: "cloudflared",
                     image: "cloudflare/cloudflared:2025.2.1",
                     args: [
                       "tunnel",
                       "--config",
                       "/etc/cloudflared/config/config.yaml",
                       "run",
                     ],
                     volumeMounts: [
                       {
                         name: "config",
                         mountPath: "/etc/cloudflared/config",
                         readOnly: true,
                       },
                       {
                         name: "creds",
                         mountPath: "/etc/cloudflared/creds",
                         readOnly: true,
                       },
                     ],
                   }])
                   + {
                     spec+: {
                       template+: {
                         spec+: {
                           volumes+: [
                             {
                               name: "creds",
                               secret: {
                                 secretName: "tunnel-credentials",
                               },
                             },
                             {
                               name: "config",
                               configMap: {
                                 name: "cloudflared",
                                 items: [
                                   {
                                     key: "config.yaml",
                                     path: "config.yaml",
                                   },
                                 ],
                               },
                             },
                           ],
                         },
                       },
                     },
                   }
;

[]
+ [configMap]
+ [deployment]
