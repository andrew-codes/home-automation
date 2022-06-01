local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet";
local secrets = import "../../secrets/dist/index.jsonnet";

local externalPort = k.core.v1.servicePort.new(80, "http")
  + k.core.v1.servicePort.withNodePort(std.extVar("alexa_shopping_list_updater_skill_port_external"))
  + k.core.v1.servicePort.withProtocol("TCP");

local containerPort = 80;
local appContainer = k.core.v1.container.new(name=std.extVar("name"), image="docker-registry:5000/alexa-shopping-list-updater-skill:latest")
    + k.core.v1.container.withImagePullPolicy("Always")
    + k.core.v1.container.withPorts({
      name: "http",
      containerPort: containerPort,
      protocol: "TCP",
    })
    + k.core.v1.container.withEnv([
    { name: "NODE_TLS_REJECT_UNAUTHORIZED", value: 0 },
    { name: "PORT", value: containerPort },
    { name: "DEBUG", value: "" },
    { name: "MQTT_HOST", value: "mqtt" },
    { name: "MQTT_PORT", value: "1883" },
    secrets["mqtt/username"],
    secrets["mqtt/password"],
    ]);
{
  "deployment": k.apps.v1.deployment.new(name=std.extVar("name"), containers=[
      appContainer
    ]) 
    + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({name: "regcred"},)
    + k.apps.v1.deployment.spec.template.spec.withServiceAccount("app"),
  "service": k.core.v1.service.new(std.extVar("name"), {name: std.extVar("name"),}, [externalPort],)
    + k.core.v1.service.spec.withType('NodePort')
}