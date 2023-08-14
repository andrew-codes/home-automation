local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local agentPatch = {
  spec: {
    template: {
      spec: {
        containers: [{
          name: 'crowdsec-agent',
          volumeMounts: [
            {
              mountPath: '/logstash',
              name: 'logstash-log-files',
            },
          ],
        }],
        volumes: [
          {
            name: 'logstash-log-files',
            persistentVolumeClaim: {
              claimName: 'elk-stack-logstash-output-pv-claim',
            },
          },
        ],
      },
    },
  },
}
;
local apiPatch = {
  spec: {
    template: {
      spec: {
        containers: [
          {
            name: 'crowdsec-lapi',
            volumeMounts: [
              {
                mountPath: '/etc/crowdsec_data',
                name: 'crowdsec-config',
              },
              {
                name: 'crowdsec-db',
                mountPath: '/var/lib/crowdsec/data',
              },
            ],
          },
          {
            name: 'dashboard',
            volumeMounts: [
              {
                name: 'crowdsec-db',
                mountPath: '/var/lib/crowdsec/data',
              },
            ],
          },
        ],
        volumes: [
          {
            name: 'crowdsec-config',
            persistentVolumeClaim: {
              claimName: 'crowdsec-config-pvc',
            },
          },
          {
            name: 'crowdsec-db',
            persistentVolumeClaim: {
              claimName: 'crowdsec-db-pvc',
            },
          },
        ],
      },
    },
  },
}
;

local apiPatchDb = {
  spec: {
    template: {
      spec: {
        containers: [
          k.core.v1.container.new(name='crowdsec-db', image='postgres:13.3-alpine')
          + k.core.v1.container.withImagePullPolicy('Always')
          + k.core.v1.container.withPorts({
            name: 'db',
            containerPort: 5432,
            protocol: 'TCP',
          },)
          + { volumeMounts: [k.core.v1.volumeMount.new('crowdsec-db-data', '/var/lib/postgresql/data'), k.core.v1.volumeMount.new('crowdsec-db-init', '/docker-entrypoint-initdb.d/init.sh') + { subPath: 'init.sh' }] }
          + { command: ['sh'], args: ['-c', 'docker-entrypoint.sh postgres'] }
          + k.core.v1.container.withEnv([
            k.core.v1.envVar.fromSecretRef('POSTGRES_DB', 'crowdsec-db-name', 'secret-value'),
            k.core.v1.envVar.fromSecretRef('POSTGRES_USER', 'crowdsec-db-username', 'secret-value'),
            k.core.v1.envVar.fromSecretRef('POSTGRES_PASSWORD', 'crowdsec-db-password', 'secret-value'),
          ]),
        ],
        volumes: [
          {
            name: 'crowdsec-db-data',
            persistentVolumeClaim: {
              claimName: 'crowdsec-db-pvc',
            },
          },
          {
            name: 'crowdsec-db-init',
            configMap: {
              name: 'crowdsec-db-init',
            },
            defaultMode: 777,
          },
        ],
      },
    },
  },
}
;

local acquisConfigMap = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'acquis-configmap',
    namespace: 'default',
  },
  data:
    {
      'acquis.yaml': |||
        source: file
        filenames:
          - /tmp/foo/*.log
          - /var/log/syslog
          - /logstash/*.log
        labels:
          type: syslog
      |||,
    },
}
;

[
  ['crowdsec-agent', 'ds', 'default', agentPatch],
  // ['crowdsec-lapi', 'deployment', 'default', apiPatch],
  ['acquis-configmap', 'configmap', 'default', acquisConfigMap],
]
