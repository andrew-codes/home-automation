local grafonnet = import 'github.com/grafana/grafonnet-lib/grafonnet/grafana.libsonnet';
local g = import 'github.com/grafana/jsonnet-libs/grafana-builder/grafana.libsonnet';
local dashboard = grafonnet.dashboard;
local row = grafonnet.row;
local prometheus = grafonnet.prometheus;
local template = grafonnet.template;
local graphPanel = grafonnet.graphPanel;
local test = import 'test.jsonnet';
local proxmox = import 'proxmox.jsonnet';

local grafana = import 'grafana/grafana.libsonnet';

{
  _config:: {
    clusterLabel: 'cluster',
    cadvisorSelector: 'job="cadvisor"',
    kubeletSelector: 'job="kubelet"',
    kubeStateMetricsSelector: 'job="kube-state-metrics"',
    nodeExporterSelector: 'job="node-exporter"',
    kubeSchedulerSelector: 'job="kube-scheduler"',
    kubeControllerManagerSelector: 'job="kube-controller-manager"',
    kubeApiserverSelector: 'job="kube-apiserver"',
    kubeProxySelector: 'job="kube-proxy"',
    podLabel: 'pod',
    hostNetworkInterfaceSelector: 'device!~"veth.+"',
    hostMountpointSelector: 'mountpoint="/"',
    windowsExporterSelector: 'job="kubernetes-windows-exporter"',
    containerfsSelector: 'container!=""',
    namespace: 'monitoring',
    version: '8.5.1',
    image: 'grafana/grafana:8.5.1',
    datasources: [{
      name: 'prometheus',
      type: 'prometheus',
      access: 'proxy',
      orgId: 1,
      url: 'http://prometheus-k8s.monitoring.svc:9090',
      version: 1,
      editable: false,
    }, {
      name: 'InfluxDB',
      type: 'influxdb',
      access: 'server',
      url: 'http://192.168.1.18:30520',
      orgId: 1,
      version: 1,
      editable: false,
      jsonData: {
        version: 'Flux',
        organization: 'smith-simms',
      },
      secureJsonData: {
        token: std.extVar('GRAFANA_INFLUXDB_TOKEN'),
      },
    }],
    'auth.github': {
      enabled: true,
      allow_sign_up: false,
      client_id: std.extVar('GRAFANA_GITHUB_CLIENT_ID'),
      client_secret: std.extVar('GRAFANA_GITHUB_CLIENT_SECRET'),
      scopes: 'user:email,read:org',
    },
    dashboards+: test.grafanaDashboards +
                 proxmox.grafanaDashboards,
  },
  grafana: grafana($._config) + {
    service+: {
      spec+: {
        type: 'NodePort',
        ports: [
          {
            name: 'http',
            port: 3000,
            targetPort: 'http',
            nodePort: std.parseInt(std.extVar('EXTERNAL_GRAFANA_PORT')),
          }
          for port in super.ports
        ],
      },
    },
  },
}
