local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '8000', true)
                   + lib.deployment.withEnvVars(0, [
                     { name: 'PAPERLESS_PORT', value: '8000' },
                     { name: 'PAPERLESS_DBHOST', value: 'localhost' },
                     { name: 'PAPERLESS_REDIS', value: 'redis://localhost:6379' },
                     { name: 'PAPERLESS_TIKA_ENABLED', value: 'true' },
                     k.core.v1.envVar.fromSecretRef('PAPERLESS_DBUSER', 'paperless-postgres-user', 'secret-value'),
                     k.core.v1.envVar.fromSecretRef('PAPERLESS_DBPASS', 'paperless-postgres-password', 'secret-value'),
                   ])
                   + {
                     deployment+: {
                       spec+: {
                         template+: {
                           spec+: {
                             securityContext+: {
                               fsGroup: 1000,
                             },
                           },
                         },
                       },
                     },
                   }
                   + lib.deployment.withPersistentVolume('paperless-data')
                   + lib.deployment.withPersistentVolume('paperless-media')
                   + lib.deployment.withPersistentVolume('paperless-export')
                   + lib.deployment.withPersistentVolume('paperless-consume')
                   + lib.deployment.withPersistentVolume('paperless-postgres-db')
                   + lib.deployment.withPersistentVolume('paperless-redis')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('paperless-data', '/usr/src/paperless/data',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('paperless-media', '/usr/src/paperless/media',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('paperless-export', '/usr/src/paperless/export',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('paperless-consume', '/usr/src/paperless/consume',))
                   + lib.deployment.withProbe(0, '/')

                   //    Postgres
                   + lib.deployment.withContainer('db', 'docker.io/library/postgres:15', {
                                                                                           livenessProbe: {
                                                                                             tcpSocket: {
                                                                                               port: 5432,
                                                                                             },
                                                                                             initialDelaySeconds: 60,
                                                                                             failureThreshold: 5,
                                                                                             timeoutSeconds: 10,
                                                                                             periodSeconds: 20,
                                                                                           },
                                                                                           readinessProbe: {
                                                                                             tcpSocket: {
                                                                                               port: 5432,
                                                                                             },
                                                                                             initialDelaySeconds: 60,
                                                                                             failureThreshold: 5,
                                                                                             timeoutSeconds: 10,
                                                                                             periodSeconds: 20,
                                                                                           },
                                                                                           startupProbe: {
                                                                                             tcpSocket: {
                                                                                               port: 5432,
                                                                                             },
                                                                                             initialDelaySeconds: 60,
                                                                                             failureThreshold: 30,
                                                                                             timeoutSeconds: 10,
                                                                                             periodSeconds: 10,
                                                                                           },
                                                                                         }
                                                                                         + k.core.v1.container.withImagePullPolicy('Always')
                                                                                         + k.core.v1.container.withPorts({
                                                                                           name: 'db',
                                                                                           containerPort: 5432,
                                                                                           protocol: 'TCP',
                                                                                         },)
                                                                                         + { volumeMounts: [k.core.v1.volumeMount.new('paperless-postgres-db', '/var/lib/postgresql/data')] }
                                                                                         + { env: [
                                                                                           k.core.v1.envVar.fromSecretRef('POSTGRES_DB', 'paperless-postgres-db', 'secret-value'),
                                                                                           k.core.v1.envVar.fromSecretRef('POSTGRES_USER', 'paperless-postgres-user', 'secret-value'),
                                                                                           k.core.v1.envVar.fromSecretRef('POSTGRES_PASSWORD', 'paperless-postgres-password', 'secret-value'),
                                                                                         ] }
                                                  ,)

                   // Redis
                   + lib.deployment.withContainer('redis', 'docker.io/library/redis:7', {

                                                                                          livenessProbe: {
                                                                                            tcpSocket: {
                                                                                              port: 6379,
                                                                                            },
                                                                                            initialDelaySeconds: 60,
                                                                                            failureThreshold: 5,
                                                                                            timeoutSeconds: 10,
                                                                                            periodSeconds: 20,
                                                                                          },
                                                                                          readinessProbe: {
                                                                                            tcpSocket: {
                                                                                              port: 6379,
                                                                                            },
                                                                                            initialDelaySeconds: 60,
                                                                                            failureThreshold: 5,
                                                                                            timeoutSeconds: 10,
                                                                                            periodSeconds: 20,
                                                                                          },
                                                                                          startupProbe: {
                                                                                            tcpSocket: {
                                                                                              port: 6379,
                                                                                            },
                                                                                            initialDelaySeconds: 60,
                                                                                            failureThreshold: 30,
                                                                                            timeoutSeconds: 10,
                                                                                            periodSeconds: 10,
                                                                                          },
                                                                                        }
                                                                                        + k.core.v1.container.withImagePullPolicy('Always')
                                                                                        + k.core.v1.container.withPorts({
                                                                                          name: 'redis',
                                                                                          containerPort: 6379,
                                                                                          protocol: 'TCP',
                                                                                        },)
                                                                                        + { volumeMounts: [k.core.v1.volumeMount.new('paperless-redis', '/data')] }
                                                                                        + { env: [
                                                                                          k.core.v1.envVar.fromSecretRef('POSTGRES_DB', 'paperless-postgres-db', 'secret-value'),
                                                                                          k.core.v1.envVar.fromSecretRef('POSTGRES_USER', 'paperless-postgres-user', 'secret-value'),
                                                                                          k.core.v1.envVar.fromSecretRef('POSTGRES_PASSWORD', 'paperless-postgres-password', 'secret-value'),
                                                                                        ] }
                                                  ,)
                   // Tika
                   + lib.deployment.withContainer('tika', 'ghcr.io/paperless-ngx/tika:latest', {

                                                                                                 livenessProbe: {
                                                                                                   tcpSocket: {
                                                                                                     port: 3000,
                                                                                                   },
                                                                                                   initialDelaySeconds: 60,
                                                                                                   failureThreshold: 5,
                                                                                                   timeoutSeconds: 10,
                                                                                                   periodSeconds: 20,
                                                                                                 },
                                                                                                 readinessProbe: {
                                                                                                   tcpSocket: {
                                                                                                     port: 3000,
                                                                                                   },
                                                                                                   initialDelaySeconds: 60,
                                                                                                   failureThreshold: 5,
                                                                                                   timeoutSeconds: 10,
                                                                                                   periodSeconds: 20,
                                                                                                 },
                                                                                                 startupProbe: {
                                                                                                   tcpSocket: {
                                                                                                     port: 3000,
                                                                                                   },
                                                                                                   initialDelaySeconds: 60,
                                                                                                   failureThreshold: 30,
                                                                                                   timeoutSeconds: 10,
                                                                                                   periodSeconds: 10,
                                                                                                 },
                                                                                               }
                                                                                               + k.core.v1.container.withImagePullPolicy('Always')
                                                                                               + k.core.v1.container.withPorts({
                                                                                                 name: 'redis',
                                                                                                 containerPort: 3000,
                                                                                                 protocol: 'TCP',
                                                                                               },)
                                                  ,)
                   // Gotenberg
                   + lib.deployment.withContainer('gotenberg', 'docker.io/gotenberg/gotenberg:7.8', {
                                                                                                      command: ['sh'],
                                                                                                      args: ['-c', 'gotenberg --chromium-disable-javascript=true --chromium-allow-list=file:///tmp/.*'],


                                                                                                      livenessProbe: {
                                                                                                        tcpSocket: {
                                                                                                          port: 9998,
                                                                                                        },
                                                                                                        initialDelaySeconds: 60,
                                                                                                        failureThreshold: 5,
                                                                                                        timeoutSeconds: 10,
                                                                                                        periodSeconds: 20,
                                                                                                      },
                                                                                                      readinessProbe: {
                                                                                                        tcpSocket: {
                                                                                                          port: 9998,
                                                                                                        },
                                                                                                        initialDelaySeconds: 60,
                                                                                                        failureThreshold: 5,
                                                                                                        timeoutSeconds: 10,
                                                                                                        periodSeconds: 20,
                                                                                                      },
                                                                                                      startupProbe: {
                                                                                                        tcpSocket: {
                                                                                                          port: 9998,
                                                                                                        },
                                                                                                        initialDelaySeconds: 60,
                                                                                                        failureThreshold: 30,
                                                                                                        timeoutSeconds: 10,
                                                                                                        periodSeconds: 10,
                                                                                                      },
                                                                                                    }
                                                                                                    + k.core.v1.container.withImagePullPolicy('Always')
                                                                                                    + k.core.v1.container.withPorts({
                                                                                                      name: 'redis',
                                                                                                      containerPort: 9998,
                                                                                                      protocol: 'TCP',
                                                                                                    },)
                                                  ,)
;

local paperlessVolumeData = lib.volume.persistentVolume.new('paperless-data', '300Gi', '/mnt/data/paperless-data');
local paperlessVolumeMedia = lib.volume.persistentVolume.new('paperless-media', '400Gi', '/mnt/data/paperless-media');
local paperlessVolumeExport = lib.volume.persistentVolume.new('paperless-export', '100Gi', '/mnt/data/paperless-export');
local paperlessVolumeConsume = lib.volume.persistentVolume.new('paperless-consume', '100Gi', '/mnt/data/paperless-consume');

local postgresVolume = lib.volume.persistentVolume.new('paperless-postgres-db', '200Gi', '/mnt/data/paperless-postgres-db');
local redisVolume = lib.volume.persistentVolume.new('paperless-redis', '80Gi', '/mnt/data/paperless-redis');


paperlessVolumeData + paperlessVolumeMedia + paperlessVolumeExport + paperlessVolumeConsume + postgresVolume + redisVolume + std.objectValues(deployment)
