local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local elasticSearch = {
  apiVersion: 'elasticsearch.k8s.elastic.co/v1',
  kind: 'Elasticsearch',
  metadata: {
    name: 'elk-stack',
  },
  spec: {
    version: '8.9.0',
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
            storageClassName: 'nfs-client',
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
      {
        name: 'data',
        count: 1,
        config: {
          'node.roles': ['data', 'ingest', 'ml', 'transform'],
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
            storageClassName: 'nfs-client',
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
}
;

local kibanaNodePort = { name: 'elasticsearch-kb-http', port: 5601, targetPort: 5601 } +
                       k.core.v1.servicePort.withNodePort(std.parseInt(
                         std.extVar('kibanaPort')
                       ))
;
local kibanaService = k.core.v1.service.new('kibana', {
                        'common.k8s.elastic.co/type': 'kibana',
                        'kibana.k8s.elastic.co/name': 'elk-stack',
                      }, [kibanaNodePort]) +
                      k.core.v1.service.spec.withType('NodePort',)
;

local elasticNodePort = { name: 'elasticsearch-es-http', port: 9200, targetPort: 'http' } +
                        k.core.v1.servicePort.withNodePort(std.parseInt(
                          std.extVar('elasticPort')
                        ))
;
local elasticSearchService = k.core.v1.service.new('elastic-search', {

                               'common.k8s.elastic.co/type': 'elasticsearch',
                               'elasticsearch.k8s.elastic.co/cluster-name': 'elk-stack',
                             }, [elasticNodePort]) +
                             k.core.v1.service.spec.withType('NodePort',)
;

local kibana = {
  apiVersion: 'kibana.k8s.elastic.co/v1',
  kind: 'Kibana',
  metadata: {
    name: 'elk-stack',
  },
  spec: {
    version: '8.9.0',
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
}
;

local logStash = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'logstash',
    namespace: 'default',
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        app: 'logstash',
      },
    },
    template: {
      metadata: {
        labels: {
          app: 'logstash',
        },
      },
      spec: {
        containers: [
          {
            name: 'logstash',
            env: [
              // k.core.v1.envVar.fromSecretRef('LOGSTASH_PW', 'elk-stack-logstash-password', 'secret-value'),
            ],
            image: 'docker.elastic.co/logstash/logstash-oss:8.9.0',
            ports: [
              {
                containerPort: 5044,
                name: 'elastic-agent',
                protocol: 'TCP',
              },
              {
                name: 'api',
                containerPort: 9600,
                protocol: 'TCP',
              },
            ],
            volumeMounts: [
              {
                name: 'config-volume',
                mountPath: '/usr/share/logstash/config',
              },
              {
                name: 'logstash-pipeline-volume',
                mountPath: '/usr/share/logstash/pipeline',
              },
              {
                name: 'logstash-output',
                mountPath: '/logstash/output',
              },
            ],
          },
        ],
        volumes: [
          {
            name: 'config-volume',
            configMap: {
              name: 'logstash-configmap',
              items: [
                {
                  key: 'logstash.yml',
                  path: 'logstash.yml',
                },
              ],
            },
          },
          {
            name: 'logstash-pipeline-volume',
            configMap: {
              name: 'logstash-configmap',
              items: [
                {
                  key: 'logstash.conf',
                  path: 'logstash.conf',
                },
              ],
            },
          },
          k.core.v1.volume.fromPersistentVolumeClaim('logstash-output', 'elk-stack-logstash-output-pvc'),
        ],
      },
    },
  },
}
;
local logStashNodePort = { name: 'logstash-http', port: 5044, targetPort: 5044 } +
                         k.core.v1.servicePort.withNodePort(std.parseInt(
                           std.extVar('logStashPort')
                         ))
;
local logStashService = k.core.v1.service.new('logstash', {
                          app: 'logstash',
                        }, [logStashNodePort]) +
                        k.core.v1.service.spec.withType('NodePort',)
;
local logStashVolume = lib.volume.persistentVolume.new('elk-stack-logstash-output', '100Gi')
;

local config = |||
  input {
    elastic_agent {
      port => 5044
      codec => plain {
        charset => "UTF-8"
      }
    }
  }
  output {
    stdout { 
      codec => line
    }
    file {
      path => "/logstash/output/%s.log"
      codec => line
    }
    elasticsearch {
      hosts => ["http://%s:%s"] 
      data_stream => "true"
      user => "%s"
      password => "%s"
    }
  }
||| % [
  '%{+YYYY-MM-dd}',
  std.extVar('k8sIp'),
  std.extVar('elasticPort'),
  std.extVar('elasticUser'),
  std.extVar('elasticPassword'),
]
;

local ymlConfig = |||
  http.host: "0.0.0.0"
  http.port: 9600
  path.config: "/usr/share/logstash/pipeline"
  path.logs: "/var/log/logstash"
|||
;

local logStashConfigMap = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'logstash-configmap',
    namespace: 'default',
  },
  data: {
    'logstash.yml': ymlConfig,
    'logstash.conf': config,
  },
}
;

// local logCurator = {
//   apiVersion: 'batch/v1beta1',
//   kind: 'CronJob',
//   metadata: {
//     name: 'elasticsearch-curator',
//     namespace: 'kube-system',
//     labels: {
//       'k8s-app': 'elk-stack',
//     },
//   },
//   spec: {
//     schedule: '0 0 1 * *',
//     jobTemplate: {
//       spec: {
//         template: {
//           backoffLimit: 1,
//           spec: {
//             restartPolicy: 'Never',
//             containers: [
//               {
//                 name: 'ingestor',
//                 image: 'python:3.6-alpine',
//                 args: [
//                   'sh',
//                   '-c',
//                   |||
//                     'pip install elasticsearch-curator && curator_cli --host elk-stack delete_indices --filter_list \'[{"filtertype":"age","source":"creation_date","direction":"older","unit":"days","unit_count":7},{"filtertype":"pattern","kind":"prefix","value":"logstash"}]\' || true'
//                   |||,
//                 ],
//               },
//             ],
//           },
//           metadata: {
//             name: 'elasticsearch-curator',
//             labels: {
//               'k8s-app': 'elk-stack',
//             },
//           },
//         },
//       },
//     },
//   },
// }
// ;

local volume1 = lib.volume.persistentVolume.new('elk-stack-1', '350Gi')
;
local volume2 = lib.volume.persistentVolume.new('elk-stack-2', '350Gi')
;


[]
+ volume1
+ volume2
+ [elasticSearch, elasticSearchService]
+ [kibana, kibanaService]
+ logStashVolume
+ [logStashConfigMap, logStash, logStashService]
