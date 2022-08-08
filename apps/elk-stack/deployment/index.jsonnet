local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local storageClassName = {
  apiVersion: 'storage.k8s.io/v1',
  kind: 'StorageClass',
  metadata: {
    name: 'standard',
  },
  provisioner: 'kubernetes.io/no-provisioner',
  reclaimPolicy: 'Retain',
  allowVolumeExpansion: true,
  volumeBindingMode: 'WaitForFirstConsumer',
};

local elasticSearch = {
  apiVersion: 'elasticsearch.k8s.elastic.co/v1',
  kind: 'Elasticsearch',
  metadata: {
    name: 'elk-stack',
  },
  spec: {
    version: '8.3.3',
    nodeSets: [{
      name: 'default',
      count: 1,
      volumeClaimTemplates: [{
        metadata: {
          name: 'elasticsearch-data',
        },
        spec: {
          accessModes: [
            'ReadWriteOnce',
          ],
          resources: {
            requests: {
              storage: '100Gi',
            },
          },
        },
      }],
      podTemplate: {
        spec: {
          initContainers: [{
            name: 'sysctl',
            securityContext: {
              privileged: true,
              runAsUser: 0,
            },
            command: ['sh', '-c', 'sysctl -w vm.max_map_count=262144'],
          }],
        },
      },
    }],
  },
};

local elasticSearchNodePort = { name: 'http', port: 5200, targetPort: 5200 } +
                              k.core.v1.servicePort.withNodePort(std.parseInt(
                                std.extVar('elasticPort')
                              ));

local elasticSearchService = k.core.v1.service.new('elk-stack', { name: 'elk-stack' }, [elasticSearchNodePort]) +
                             k.core.v1.service.spec.withType('NodePort',);

local kibanaNodePort = { name: 'http', port: 5601, targetPort: 5601 } +
                       k.core.v1.servicePort.withNodePort(std.parseInt(
                         std.extVar('kibanaPort')
                       ));
local kibanaService = k.core.v1.service.new('kibana', { name: 'kibana' }, [kibanaNodePort]) +
                      k.core.v1.service.spec.withType('NodePort',);

local kibana = {
  apiVersion: 'kibana.k8s.elastic.co/v1',
  kind: 'Kibana',
  metadata: {
    name: 'elk-stack',
  },
  spec: {
    version: '8.3.3',
    count: 1,
    elasticsearchRef: {
      name: 'elk-stack',
    },
  },
};

local volume = lib.volume.persistentVolume.new('elk-stack-data', '150Gi', '/mnt/data/elk-stack');

[volume, storageClassName, elasticSearch, kibana, elasticSearchService, kibanaService]
