local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet";
local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";

lib.deployment.newWithExternalPort(std.extVar("name"), std.extVar("image"), std.extVar("port_external"), std.extVar("secrets"))
  + k.core.v1.container.withEnv([
    { name: "DEBUG", value: "" },
    { name: "MQTT_HOST", value: "mqtt" },
    { name: "MQTT_PORT", value: "1883" },
  ])