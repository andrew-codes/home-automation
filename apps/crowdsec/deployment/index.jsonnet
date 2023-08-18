local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local volume1 = lib.volume.persistentVolume.new('crowdsec-config', '100Mi')
;
local volume2 = lib.volume.persistentVolume.new('crowdsec-db', '80Gi')
;

local dbInit = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'crowdsec-db-init',
    namespace: 'default',
  },
  data:
    {
      'init.sh': |||
        #!/bin/bash
        set -e

        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
          CREATE DATABASE metabase;
          GRANT ALL PRIVILEGES ON DATABASE metabase TO crowdsec;
        EOSQL
      |||,
    },
}
;

local dashboardNodePort = { name: 'crowdsec-dashboard-http', port: 3000, targetPort: 3000 } +
                          k.core.v1.servicePort.withNodePort(std.parseInt(
                            std.extVar('crowdsecDashboardPort')
                          ))
;
local dashboardService = k.core.v1.service.new('crowdsec-dashboard', {
                           'k8s-app': 'crowdsec',
                         }, [dashboardNodePort]) +
                         k.core.v1.service.spec.withType('NodePort',)
;

local apiNodePort = { name: 'crowdsec-api-http', port: 8080, targetPort: 8080 } +
                    k.core.v1.servicePort.withNodePort(std.parseInt(
                      std.extVar('crowdsecApiPort')
                    ))
;
local apiService = k.core.v1.service.new('crowdsec-api', {
                     'k8s-app': 'crowdsec',
                   }, [apiNodePort]) +
                   k.core.v1.service.spec.withType('NodePort',)
;

[dashboardService, apiService]
+ volume1 + volume2
