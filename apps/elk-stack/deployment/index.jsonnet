local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local elasticSearch = {
  apiVersion: 'elasticsearch.k8s.elastic.co/v1',
  kind: 'Elasticsearch',
  metadata: {
    name: 'elk-stack',
  },
  spec: {
    version: '8.3.3',
    http: {
      tls: {
        selfSignedCertificate: {
          disabled: true,
        },
      },
    },
    nodeSets: [
      {
        name: 'default',
        count: 1,
        config: {
          'node.roles': ['master'],
          'xpack.ml.enabled': true,
        },
        volumeClaimTemplates: [{
          metadata: {
            name: 'elasticsearch-data',
          },
          spec: {
            accessModes: [
              'ReadWriteMany',
            ],
            resources: {
              requests: {
                storage: '350Gi',
              },
            },
            storageClassName: 'manual',
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
      },
    ],
  },
};

local kibanaNodePort = { name: 'elk-stack-kb-http', port: 5601, targetPort: 5601 } +
                       k.core.v1.servicePort.withNodePort(std.parseInt(
                         std.extVar('kibanaPort')
                       ));
local kibanaService = k.core.v1.service.new('kibana', {
                        'common.k8s.elastic.co/type': 'kibana',
                        'kibana.k8s.elastic.co/name': 'elk-stack',
                      }, [kibanaNodePort]) +
                      k.core.v1.service.spec.withType('NodePort',);

local elasticNodePort = { name: 'elk-stack-es-http', port: 9200, targetPort: 'http' } +
                        k.core.v1.servicePort.withNodePort(std.parseInt(
                          std.extVar('elasticPort')
                        ));
local elasticSearchService = k.core.v1.service.new('elastic-search', {

                               'common.k8s.elastic.co/type': 'elasticsearch',
                               'elasticsearch.k8s.elastic.co/cluster-name': 'elk-stack',
                             }, [elasticNodePort]) +
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
    config: {
      'server.publicBaseUrl': 'https://kibana.smith-simms.family',
      'elasticsearch.requestTimeout': 300000,
    },
    http: {
      tls: {
        selfSignedCertificate: {
          disabled: true,
        },
      },
    },
    elasticsearchRef: {
      name: 'elk-stack',
    },
  },
};

local volume1 = k.core.v1.persistentVolume.new('elk-stack-pv-volume')
                + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
                + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
                + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
                + k.core.v1.persistentVolume.spec.withCapacity({ storage: '350Gi' })
                + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/elk-stack-elasticsearch-data-1');

[volume1, elasticSearch, elasticSearchService, kibana, kibanaService]
