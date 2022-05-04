local grafonnet = import 'github.com/grafana/grafonnet-lib/grafonnet/grafana.libsonnet';
local g = import 'github.com/grafana/jsonnet-libs/grafana-builder/grafana.libsonnet';
local dashboard = grafonnet.dashboard;
local row = grafonnet.row;
local template = grafonnet.template;
local graphPanel = grafonnet.graphPanel;
local influxdb = grafonnet.influxdb;
local singlestat = grafonnet.singlestat;
local bargauge = grafonnet.barGaugePanel;

local grafana = import 'grafana/grafana.libsonnet';

{
  _config+:: {
  },
  grafanaDashboards+:: {
    'network-dashboard.json':
      {
        __inputs: [
        ],
        __requires: [
        ],
        annotations: {
          list: [
          ],
        },
        editable: false,
        graphTooltip: 0,
        hideControls: false,
        links: [
        ],
        refresh: '30s',
        style: 'dark',
        title: 'Network',
        tags: [],
        templating+: {
          list+: [],
        },
        panels: [
          {
            datasource: {
              type: 'influxdb',
              uid: 'P951FEA4DE68E13C5',
            },
            description: '',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                mappings: [],
                min: 0,
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'orange',
                      value: 10000000000,
                    },
                    {
                      color: 'red',
                      value: 15000000000,
                    },
                  ],
                },
                unit: 'decbytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 4,
              w: 4,
              x: 0,
              y: 0,
            },
            options: {
              colorMode: 'value',
              graphMode: 'area',
              justifyMode: 'auto',
              orientation: 'auto',
              reduceOptions: {
                calcs: [
                  'lastNotNull',
                ],
                fields: '',
                values: false,
              },
              textMode: 'auto',
            },
            pluginVersion: '8.5.1',
            targets: [
              {
                datasource: {
                  type: 'influxdb',
                  uid: 'P951FEA4DE68E13C5',
                },
                query: 'from(bucket: "home-automation")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["entity_id"] == "unifi_gateway_www")\n  |> filter(fn: (r) => r["_field"] == "rx_bytes-r" or r["_field"] == "tx_bytes-r") \n  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")\n  |> map(fn: (r) => ({_value : (float(v: r["rx_bytes-r"]) + float(v: r["tx_bytes-r"])), _start: r["_start"], _stop: r["_stop"], _time: r["_time"]}))\n  |> integral(\n    unit: 10s,\n    column: "_value",\n    timeColumn: "_time",\n    interpolate: "",\n)',
                refId: 'A',
              },
            ],
            title: 'Total Bandwidth Usage',
            transparent: true,
            type: 'stat',
          },
          {
            datasource: {
              type: 'influxdb',
              uid: 'P951FEA4DE68E13C5',
            },
            description: '',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: 'Speed',
                  axisPlacement: 'auto',
                  barAlignment: 0,
                  drawStyle: 'line',
                  fillOpacity: 0,
                  gradientMode: 'none',
                  hideFrom: {
                    legend: false,
                    tooltip: false,
                    viz: false,
                  },
                  lineInterpolation: 'linear',
                  lineStyle: {
                    fill: 'solid',
                  },
                  lineWidth: 1,
                  pointSize: 5,
                  scaleDistribution: {
                    type: 'linear',
                  },
                  showPoints: 'auto',
                  spanNulls: false,
                  stacking: {
                    group: 'A',
                    mode: 'none',
                  },
                  thresholdsStyle: {
                    mode: 'line',
                  },
                },
                decimals: 1,
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'purple',
                      value: 1000,
                    },
                  ],
                },
                unit: 'Mbits',
              },
              overrides: [
                {
                  __systemRef: 'hideSeriesFrom',
                  matcher: {
                    id: 'byNames',
                    options: {
                      mode: 'exclude',
                      names: [
                        'xput_up',
                      ],
                      prefix: 'All except:',
                      readOnly: true,
                    },
                  },
                  properties: [
                    {
                      id: 'custom.hideFrom',
                      value: {
                        legend: false,
                        tooltip: false,
                        viz: true,
                      },
                    },
                  ],
                },
                {
                  matcher: {
                    id: 'byName',
                    options: 'xput_down',
                  },
                  properties: [
                    {
                      id: 'displayName',
                      value: 'Download',
                    },
                  ],
                },
                {
                  matcher: {
                    id: 'byName',
                    options: 'xput_up',
                  },
                  properties: [
                    {
                      id: 'displayName',
                      value: 'Upload',
                    },
                  ],
                },
              ],
            },
            gridPos: {
              h: 7,
              w: 7,
              x: 4,
              y: 0,
            },
            options: {
              legend: {
                calcs: [],
                displayMode: 'list',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
                sort: 'none',
              },
            },
            targets: [
              {
                datasource: {
                  type: 'influxdb',
                  uid: 'P951FEA4DE68E13C5',
                },
                query: 'from(bucket: "home-automation")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["entity_id"] == "unifi_gateway_www")\n  |> filter(fn: (r) => r["_field"] == "xput_down" or r["_field"] == "xput_up")\n  |> keep(columns: ["_field", "_value", "_time"])',
                refId: 'A',
              },
            ],
            title: 'Network Speeds',
            type: 'timeseries',
          },
        ],
      },
  },
}
