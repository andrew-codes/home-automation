local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet";

local configMap = lib.volume.configMapVolume.new("cloudflared-config", {
  "config.yml": '\ntunnel: "e1f74da6-7c3c-4f61-a509-e4ef0fe2cc81"\ncredentials-file: "/etc/cloudflared/auth/auth.json"\nno-autoupdate: true\nprotocol: "http2"\ningress:\n- hostname: "ha.smith-simms.family"\n  service: "http://home-assistant:8123"\n- hostname: "device-ha.smith-simms.family"\n  service: "http://home-assistant:8123"\n- service: "http_status:404"\n',
})
;

local deployment = lib.deployment.new("cloudflared", "cloudflare/cloudflared:2024.3.0", [])
                   + lib.deployment.withContainerAugmentation(0, { args: ["tunnel", "--config", "/etc/cloudflared/config/config.yml", "run"] })

                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("cloudflared-config", "/etc/cloudflared/config"))
                   + lib.deployment.withConfigMapVolume("cloudflared-config", 511, { items: [{ key: "config.yml", path: "config.yml" }] })

                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("tunnel-proxy-auth", "/etc/cloudflared/auth",))
                   + lib.deployment.withSecretVolume("tunnel-proxy-auth", "tunnel-proxy-auth", 511, [{ key: "secret-value", path: "auth.json" }])

                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("tunnel-proxy-cert", "/etc/cloudflared",))
                   + lib.deployment.withSecretVolume("tunnel-proxy-cert", "tunnel-proxy-cert", 511, [{ key: "secret-value", path: "cert.pem" }])
;

configMap + std.objectValues(deployment)
