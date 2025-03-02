local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local nodePort = { name: "vmcluster-victoria-metrics-cluster-vminsert-http", port: 8480, targetPort: 8480 } +
                 k.core.v1.servicePort.withNodePort(std.parseInt(
                   std.extVar("externalPort")
                 ))
;
local service = k.core.v1.service.new("vmcluster-victoria-metrics-cluster-vminsert-node-port", {
                  app: "vminsert",
                  "app.kubernetes.io/instance": "vmcluster",
                  "app.kubernetes.io/name": "victoria-metrics-cluster",
                }, [nodePort]) +
                k.core.v1.service.spec.withType("NodePort",)
;

service
