local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local deployment = lib.deployment.new("guest-db", std.extVar("image"), "", "", "27017")
                   + lib.deployment.withPersistentVolume("guest-db")
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("guest-db", "/data/db",))
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [{ key: "kubernetes.io/hostname", operator: "In", values: ["k8s-main"] }] },
                         ],
                       },
                     },
                   },)
;

local guestDbVolume = lib.volume.persistentVolume.new("guest-db", "5Gi")
;

[]
+ guestDbVolume
+ std.objectValues(deployment)
