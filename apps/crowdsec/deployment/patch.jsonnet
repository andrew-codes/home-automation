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
        containers: [{
          name: 'crowdsec-lapi',
          volumeMounts: [
            {
              mountPath: '/etc/crowdsec_data',
              name: 'crowdsec-config',
            },
          ],
        }],
        volumes: [
          {
            name: 'crowdsec-config',
            persistentVolumeClaim: {
              claimName: 'crowdsec-config-pvc',
            },
          },
        ],
      },
    },
  },
}
;
local apiPatch2 = {
  spec: {
    template: {
      spec: {
        containers: [{
          name: 'crowdsec-lapi',
          volumeMounts: [
            {
              name: 'crowdsec-db',
              mountPath: '/var/lib/crowdsec/data',
            },
          ],
        },{
          name: 'dashboard',
          volumeMounts: [
            {
              name: 'crowdsec-db',
              mountPath: '/var/lib/crowdsec/data',
            },
          ],
        }],
        volumes: [
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

[
  ['crowdsec-agent', 'ds', 'default', agentPatch],
  ['crowdsec-lapi', 'deployment', 'default', apiPatch],
  ['crowdsec-lapi', 'deployment', 'default', apiPatch2],
]
