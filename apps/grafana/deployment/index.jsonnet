local grafonnet = import 'github.com/grafana/grafonnet-lib/grafonnet/grafana.libsonnet';
local g = import 'github.com/grafana/jsonnet-libs/grafana-builder/grafana.libsonnet';
local dashboard = grafonnet.dashboard;
local row = grafonnet.row;
local prometheus = grafonnet.prometheus;
local template = grafonnet.template;
local graphPanel = grafonnet.graphPanel;

local grafana = import 'grafana/grafana.libsonnet';

local network = import 'network.jsonnet';
local proxmox = import 'proxmox.jsonnet';

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
    namespace: 'default',
    version: '8.5.1',
    image: 'grafana/grafana:9.0.1',
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
      url: 'https://influxdb.smith-simms.family',
      orgId: 1,
      version: 1,
      editable: false,
      jsonData: {
        version: 'Flux',
        organization: 'smith-simms',
      },
      secureJsonData: {
        token: std.extVar('grafana_influxdb_token'),
      },
    }],
    dashboards+: proxmox.grafanaDashboards + network.grafanaDashboards,
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
            nodePort: std.parseInt(std.extVar('port')),
          }
          for port in super.ports
        ],
      },
    },
  } + {
    config+: {
      stringData: {
        'grafana.ini': '[date_formats]\ndefault_timezone = UTC\n\n\n        [security]\n        admin_password = ' + std.extVar('grafana_password') + '\n \n        admin_user = ' + std.extVar('grafana_username') + '\n\n        ',
      },
    },
  },
}
