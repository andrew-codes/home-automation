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
    'proxmox-dashboard.json':
      local dataSourceTemplate = template.datasource(
        name='datasource',
        query='influxdb',
        current='InfluxDB',
        refresh=2,
      );
      local bucketTemplate = template.new(
        name='bucket',
        datasource='$datasource',
        query='buckets()',
        label='bucket',
        refresh=2,
        current='proxmox'
      );
      local serverTemplate = template.new(
        name='server',
        datasource='$datasource',
        query='from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => \n    r._measurement == "system" and\n    r.object == "nodes"\n  )\n  |> keyValues(keyColumns: ["host"])\n  |> group()\n  |> keep(columns: ["host"])\n  |> distinct(column: "host")\n\n',
        label='server',
        refresh=2,
        current='pve'
      );
      local driveLifeExpectancy =
        bargauge.new(
          title='Drive Life Expectancy',
          datasource='$datasource',
          unit='percent',
          thresholds=[
            {
              color: 'green',
              value: null,
            },
            {
              color: '#EAB839',
              value: 70,
            },
            {
              color: 'red',
              value: 85,
            },
          ]
        )
        .addTarget(influxdb.target('from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "smart_attribute")\n  |> filter(fn: (r) => r["name"] == "Percentage_Used")\n  |> group(columns: ["model"])\n  |> distinct()')) + {
          fieldConfig+: {
            defaults+: {
              max: 100,
              min: 0,
            },
          },
          gridPos: {
            h: 6,
            w: 6,
            x: 12,
            y: 1,
          },
          options+: {
            displayMode: 'lcd',
            orientation: 'vertical',
            showUnfilled: false,
          },
          transparent: true,
        };

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
        title: 'Proxmox',
        tags: ['proxmox', 'node'],
        templating+: {
          list+: [dataSourceTemplate, bucketTemplate, serverTemplate],
        },
        panels: [
          {
            collapsed: false,
            gridPos: {
              h: 1,
              w: 24,
              x: 0,
              y: 0,
            },
            panels: [
              {
                datasource: '$datasource',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    decimals: 2,
                    mappings: [],
                    max: 1,
                    min: 0,
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: '#EAB839',
                          value: 0.75,
                        },
                        {
                          color: 'red',
                          value: 0.8,
                        },
                      ],
                    },
                    unit: 'percentunit',
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 6,
                  w: 3,
                  x: 0,
                  y: 1,
                },
                options: {
                  colorMode: 'value',
                  graphMode: 'area',
                  justifyMode: 'auto',
                  orientation: 'horizontal',
                  reduceOptions: {
                    calcs: [
                      'lastNotNull',
                    ],
                    fields: '',
                    values: false,
                  },
                  text: {},
                  textMode: 'auto',
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "cpu"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean)',
                    refId: 'A',
                  },
                ],
                title: 'Server CPU',
                type: 'stat',
              },
              {
                datasource: '$datasource',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    mappings: [],
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: 'red',
                          value: 80,
                        },
                      ],
                    },
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 3,
                  w: 3,
                  x: 3,
                  y: 1,
                },
                options: {
                  colorMode: 'none',
                  graphMode: 'none',
                  justifyMode: 'auto',
                  orientation: 'auto',
                  reduceOptions: {
                    calcs: [
                      'lastNotNull',
                    ],
                    fields: '',
                    values: false,
                  },
                  text: {},
                  textMode: 'auto',
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "cpus"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> limit(n:1)',
                    refId: 'A',
                  },
                ],
                title: 'Logical Cores',
                type: 'stat',
              },
              {
                datasource: '$datasource',
                description: '',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    mappings: [],
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: 'red',
                          value: 80,
                        },
                      ],
                    },
                    unit: 'bytes',
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 3,
                  w: 3,
                  x: 6,
                  y: 1,
                },
                options: {
                  colorMode: 'none',
                  graphMode: 'none',
                  justifyMode: 'auto',
                  orientation: 'auto',
                  reduceOptions: {
                    calcs: [
                      'lastNotNull',
                    ],
                    fields: '',
                    values: false,
                  },
                  text: {},
                  textMode: 'auto',
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "memory" and\n    r._field == "memtotal"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> limit(n:1)',
                    refId: 'A',
                  },
                ],
                title: 'Total Memory',
                type: 'stat',
              },
              {
                datasource: '$datasource',
                description: '',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    mappings: [],
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: 'red',
                          value: 80,
                        },
                      ],
                    },
                    unit: 'bytes',
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 3,
                  w: 3,
                  x: 9,
                  y: 1,
                },
                options: {
                  colorMode: 'none',
                  graphMode: 'none',
                  justifyMode: 'auto',
                  orientation: 'auto',
                  reduceOptions: {
                    calcs: [
                      'lastNotNull',
                    ],
                    fields: '',
                    values: false,
                  },
                  text: {},
                  textMode: 'auto',
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "memory" and\n    r._field == "swaptotal"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> limit(n:1)',
                    refId: 'A',
                  },
                ],
                title: 'Swap Total',
                type: 'stat',
              },
              driveLifeExpectancy,
              {
                datasource: '$datasource',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    displayName: '${__field.labels.host} (${__field.labels.type})',
                    mappings: [],
                    max: 100,
                    min: 0,
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: 'red',
                          value: 80,
                        },
                      ],
                    },
                    unit: 'percent',
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 6,
                  w: 6,
                  x: 18,
                  y: 1,
                },
                options: {
                  displayMode: 'gradient',
                  orientation: 'horizontal',
                  reduceOptions: {
                    calcs: [
                      'lastNotNull',
                    ],
                    fields: '',
                    values: false,
                  },
                  showUnfilled: true,
                  text: {},
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) => r._measurement == "system")\n  |> filter(fn: (r) => r._field == "avail" or r._field == "used")\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> last()\n  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")\n  |> map(fn: (r) => ({ r with \n    _time: r._time,\n    _measurement: r.measurement,\n    _field: "used_perc",\n    _value: float(v: 100) / (float(v: r.avail) + float(v: r.used)) * float(v:r.used)\n     }))\n  |> drop(columns: ["avail","used"])\n',
                    refId: 'A',
                  },
                ],
                title: 'Storage Pools',
                type: 'bargauge',
              },
              {
                datasource: '$datasource',
                description: '',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    decimals: 2,
                    mappings: [],
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: 'red',
                          value: 80,
                        },
                      ],
                    },
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 3,
                  w: 3,
                  x: 3,
                  y: 4,
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
                  text: {},
                  textMode: 'auto',
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "avg1"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n',
                    refId: 'A',
                  },
                ],
                title: 'Load Avg (1m)',
                type: 'stat',
              },
              {
                datasource: '$datasource',
                description: "Memory in use by Host OS, VM's and Containers",
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    decimals: 2,
                    mappings: [],
                    max: 64,
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: '#EAB839',
                          value: 50,
                        },
                        {
                          color: 'red',
                          value: 60,
                        },
                      ],
                    },
                    unit: 'gbytes',
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 3,
                  w: 3,
                  x: 6,
                  y: 4,
                },
                options: {
                  colorMode: 'value',
                  graphMode: 'none',
                  justifyMode: 'auto',
                  orientation: 'auto',
                  reduceOptions: {
                    calcs: [
                      'lastNotNull',
                    ],
                    fields: '',
                    values: false,
                  },
                  text: {},
                  textMode: 'auto',
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "memory" and\n    r._field == "memused"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> map(fn: (r) => ({\n        r with\n        _value: float(v: r._value) / 1073741824.0\n      })\n    )\n  |> last()',
                    refId: 'A',
                  },
                ],
                title: 'Memory in Use',
                type: 'stat',
              },
              {
                datasource: '$datasource',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    decimals: 2,
                    mappings: [],
                    max: 1,
                    min: 0,
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: '#EAB839',
                          value: 0.5,
                        },
                        {
                          color: 'red',
                          value: 0.75,
                        },
                      ],
                    },
                    unit: 'percentunit',
                  },
                  overrides: [],
                },
                gridPos: {
                  h: 3,
                  w: 3,
                  x: 9,
                  y: 4,
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
                  text: {},
                  textMode: 'auto',
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "wait"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn:mean, createEmpty: false)',
                    refId: 'A',
                  },
                ],
                title: 'I/O Wait',
                type: 'stat',
              },
              {
                datasource: '$datasource',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    custom: {
                      align: 'auto',
                      displayMode: 'auto',
                      filterable: true,
                    },
                    mappings: [],
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: 'red',
                          value: 80,
                        },
                      ],
                    },
                    unit: 'none',
                  },
                  overrides: [
                    {
                      matcher: {
                        id: 'byName',
                        options: 'Time',
                      },
                      properties: [
                        {
                          id: 'unit',
                          value: 'short',
                        },
                      ],
                    },
                    {
                      matcher: {
                        id: 'byName',
                        options: 'Uptime',
                      },
                      properties: [
                        {
                          id: 'unit',
                          value: 'dtdhms',
                        },
                      ],
                    },
                  ],
                },
                gridPos: {
                  h: 6,
                  w: 12,
                  x: 0,
                  y: 7,
                },
                options: {
                  footer: {
                    fields: '',
                    reducer: [
                      'sum',
                    ],
                    show: false,
                  },
                  showHeader: true,
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: -10m)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "uptime")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> filter(fn: (r) => r._value > 0)\n  |> last()\n  |> limit(n:1)\n  |> group(columns: ["_measurement"])\n  |> keep(columns: ["_time","host","_value"])\n  \n',
                    refId: 'A',
                  },
                ],
                title: 'Running VMs',
                transformations: [
                  {
                    id: 'organize',
                    options: {
                      excludeByName: {},
                      indexByName: {
                        _time: 0,
                        _value: 2,
                        host: 1,
                      },
                      renameByName: {
                        _time: 'Time',
                        _value: 'Uptime',
                        host: 'VM',
                      },
                    },
                  },
                ],
                type: 'table',
              },
              {
                datasource: '$datasource',
                fieldConfig: {
                  defaults: {
                    color: {
                      mode: 'thresholds',
                    },
                    custom: {
                      align: 'auto',
                      displayMode: 'auto',
                      filterable: true,
                    },
                    mappings: [],
                    thresholds: {
                      mode: 'absolute',
                      steps: [
                        {
                          color: 'green',
                          value: null,
                        },
                        {
                          color: 'red',
                          value: 80,
                        },
                      ],
                    },
                    unit: 'none',
                  },
                  overrides: [
                    {
                      matcher: {
                        id: 'byName',
                        options: 'Time',
                      },
                      properties: [
                        {
                          id: 'unit',
                          value: 'short',
                        },
                      ],
                    },
                    {
                      matcher: {
                        id: 'byName',
                        options: 'Uptime',
                      },
                      properties: [
                        {
                          id: 'unit',
                          value: 'dtdhms',
                        },
                      ],
                    },
                  ],
                },
                gridPos: {
                  h: 6,
                  w: 12,
                  x: 12,
                  y: 7,
                },
                options: {
                  footer: {
                    fields: '',
                    reducer: [
                      'sum',
                    ],
                    show: false,
                  },
                  showHeader: true,
                },
                pluginVersion: '8.3.6',
                targets: [
                  {
                    datasource: '$datasource',
                    query: 'from(bucket: "${bucket}")\n  |> range(start: -10m)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "uptime")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> filter(fn: (r) => r._value > 0)\n  |> last()\n  |> limit(n:1)\n  |> group(columns: ["_measurement"])\n  |> keep(columns: ["_time","host","_value"])\n  \n',
                    refId: 'A',
                  },
                ],
                title: 'Running LXCs',
                transformations: [
                  {
                    id: 'organize',
                    options: {
                      excludeByName: {},
                      indexByName: {
                        _time: 0,
                        _value: 2,
                        host: 1,
                      },
                      renameByName: {
                        _time: 'Time',
                        _value: 'Uptime',
                        host: 'VM',
                      },
                    },
                  },
                ],
                type: 'table',
              },
            ],
            title: 'Summary',
            type: 'row',
          },

          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                decimals: 2,
                mappings: [],
                max: 1,
                min: 0,
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: '#EAB839',
                      value: 0.75,
                    },
                    {
                      color: 'red',
                      value: 0.8,
                    },
                  ],
                },
                unit: 'percentunit',
              },
              overrides: [],
            },
            gridPos: {
              h: 6,
              w: 3,
              x: 0,
              y: 1,
            },
            options: {
              colorMode: 'value',
              graphMode: 'area',
              justifyMode: 'auto',
              orientation: 'horizontal',
              reduceOptions: {
                calcs: [
                  'lastNotNull',
                ],
                fields: '',
                values: false,
              },
              text: {},
              textMode: 'auto',
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "cpu"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean)',
                refId: 'A',
              },
            ],
            title: 'Server CPU',
            type: 'stat',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
              },
              overrides: [],
            },
            gridPos: {
              h: 3,
              w: 3,
              x: 3,
              y: 1,
            },
            options: {
              colorMode: 'none',
              graphMode: 'none',
              justifyMode: 'auto',
              orientation: 'auto',
              reduceOptions: {
                calcs: [
                  'lastNotNull',
                ],
                fields: '',
                values: false,
              },
              text: {},
              textMode: 'auto',
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "cpus"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> limit(n:1)',
                refId: 'A',
              },
            ],
            title: 'Logical Cores',
            type: 'stat',
          },
          {
            datasource: '$datasource',
            description: '',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'bytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 3,
              w: 3,
              x: 6,
              y: 1,
            },
            options: {
              colorMode: 'none',
              graphMode: 'none',
              justifyMode: 'auto',
              orientation: 'auto',
              reduceOptions: {
                calcs: [
                  'lastNotNull',
                ],
                fields: '',
                values: false,
              },
              text: {},
              textMode: 'auto',
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "memory" and\n    r._field == "memtotal"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> limit(n:1)',
                refId: 'A',
              },
            ],
            title: 'Total Memory',
            type: 'stat',
          },
          {
            datasource: '$datasource',
            description: '',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'bytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 3,
              w: 3,
              x: 9,
              y: 1,
            },
            options: {
              colorMode: 'none',
              graphMode: 'none',
              justifyMode: 'auto',
              orientation: 'auto',
              reduceOptions: {
                calcs: [
                  'lastNotNull',
                ],
                fields: '',
                values: false,
              },
              text: {},
              textMode: 'auto',
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "memory" and\n    r._field == "swaptotal"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> limit(n:1)',
                refId: 'A',
              },
            ],
            title: 'Swap Total',
            type: 'stat',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                displayName: '${__field.labels.host} (${__field.labels.type})',
                mappings: [],
                max: 100,
                min: 0,
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'percent',
              },
              overrides: [],
            },
            gridPos: {
              h: 6,
              w: 12,
              x: 12,
              y: 1,
            },
            options: {
              displayMode: 'gradient',
              orientation: 'horizontal',
              reduceOptions: {
                calcs: [
                  'lastNotNull',
                ],
                fields: '',
                values: false,
              },
              showUnfilled: true,
              text: {},
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) => r._measurement == "system")\n  |> filter(fn: (r) => r._field == "avail" or r._field == "used")\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> last()\n  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")\n  |> map(fn: (r) => ({ r with \n    _time: r._time,\n    _measurement: r.measurement,\n    _field: "used_perc",\n    _value: float(v: 100) / (float(v: r.avail) + float(v: r.used)) * float(v:r.used)\n     }))\n  |> drop(columns: ["avail","used"])\n',
                refId: 'A',
              },
            ],
            title: 'Storage Pools',
            type: 'bargauge',
          },
          {
            datasource: '$datasource',
            description: '',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                decimals: 2,
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
              },
              overrides: [],
            },
            gridPos: {
              h: 3,
              w: 3,
              x: 3,
              y: 4,
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
              text: {},
              textMode: 'auto',
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "avg1"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n',
                refId: 'A',
              },
            ],
            title: 'Load Avg (1m)',
            type: 'stat',
          },
          {
            datasource: '$datasource',
            description: "Memory in use by Host OS, VM's and Containers",
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                decimals: 2,
                mappings: [],
                max: 64,
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: '#EAB839',
                      value: 50,
                    },
                    {
                      color: 'red',
                      value: 60,
                    },
                  ],
                },
                unit: 'gbytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 3,
              w: 3,
              x: 6,
              y: 4,
            },
            options: {
              colorMode: 'value',
              graphMode: 'none',
              justifyMode: 'auto',
              orientation: 'auto',
              reduceOptions: {
                calcs: [
                  'lastNotNull',
                ],
                fields: '',
                values: false,
              },
              text: {},
              textMode: 'auto',
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "memory" and\n    r._field == "memused"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> map(fn: (r) => ({\n        r with\n        _value: float(v: r._value) / 1073741824.0\n      })\n    )\n  |> last()',
                refId: 'A',
              },
            ],
            title: 'Memory in Use',
            type: 'stat',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                decimals: 2,
                mappings: [],
                max: 1,
                min: 0,
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: '#EAB839',
                      value: 0.5,
                    },
                    {
                      color: 'red',
                      value: 0.75,
                    },
                  ],
                },
                unit: 'percentunit',
              },
              overrides: [],
            },
            gridPos: {
              h: 3,
              w: 3,
              x: 9,
              y: 4,
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
              text: {},
              textMode: 'auto',
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "wait"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn:mean, createEmpty: false)',
                refId: 'A',
              },
            ],
            title: 'I/O Wait',
            type: 'stat',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                custom: {
                  align: 'auto',
                  displayMode: 'auto',
                  filterable: true,
                },
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'none',
              },
              overrides: [
                {
                  matcher: {
                    id: 'byName',
                    options: 'Time',
                  },
                  properties: [
                    {
                      id: 'unit',
                      value: 'short',
                    },
                  ],
                },
                {
                  matcher: {
                    id: 'byName',
                    options: 'Uptime',
                  },
                  properties: [
                    {
                      id: 'unit',
                      value: 'dtdhms',
                    },
                  ],
                },
              ],
            },
            gridPos: {
              h: 6,
              w: 12,
              x: 0,
              y: 7,
            },
            options: {
              footer: {
                fields: '',
                reducer: [
                  'sum',
                ],
                show: false,
              },
              showHeader: true,
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: -10m)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "uptime")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> filter(fn: (r) => r._value > 0)\n  |> last()\n  |> limit(n:1)\n  |> group(columns: ["_measurement"])\n  |> keep(columns: ["_time","host","_value"])\n  \n',
                refId: 'A',
              },
            ],
            title: 'Running VMs',
            transformations: [
              {
                id: 'organize',
                options: {
                  excludeByName: {},
                  indexByName: {
                    _time: 0,
                    _value: 2,
                    host: 1,
                  },
                  renameByName: {
                    _time: 'Time',
                    _value: 'Uptime',
                    host: 'VM',
                  },
                },
              },
            ],
            type: 'table',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'thresholds',
                },
                custom: {
                  align: 'auto',
                  displayMode: 'auto',
                  filterable: true,
                },
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'none',
              },
              overrides: [
                {
                  matcher: {
                    id: 'byName',
                    options: 'Time',
                  },
                  properties: [
                    {
                      id: 'unit',
                      value: 'short',
                    },
                  ],
                },
                {
                  matcher: {
                    id: 'byName',
                    options: 'Uptime',
                  },
                  properties: [
                    {
                      id: 'unit',
                      value: 'dtdhms',
                    },
                  ],
                },
              ],
            },
            gridPos: {
              h: 6,
              w: 12,
              x: 12,
              y: 7,
            },
            options: {
              footer: {
                fields: '',
                reducer: [
                  'sum',
                ],
                show: false,
              },
              showHeader: true,
            },
            pluginVersion: '8.3.6',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: -10m)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "uptime")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> filter(fn: (r) => r._value > 0)\n  |> last()\n  |> limit(n:1)\n  |> group(columns: ["_measurement"])\n  |> keep(columns: ["_time","host","_value"])\n  \n',
                refId: 'A',
              },
            ],
            title: 'Running LXCs',
            transformations: [
              {
                id: 'organize',
                options: {
                  excludeByName: {},
                  indexByName: {
                    _time: 0,
                    _value: 2,
                    host: 1,
                  },
                  renameByName: {
                    _time: 'Time',
                    _value: 'Uptime',
                    host: 'VM',
                  },
                },
              },
            ],
            type: 'table',
          },
          {
            collapsed: false,
            gridPos: {
              h: 1,
              w: 24,
              x: 0,
              y: 13,
            },
            panels: [

            ],
            title: 'Memory and CPU usage',
            type: 'row',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: 'Percent',
                  axisPlacement: 'left',
                  barAlignment: 0,
                  drawStyle: 'line',
                  fillOpacity: 10,
                  gradientMode: 'none',
                  hideFrom: {
                    legend: false,
                    tooltip: false,
                    viz: false,
                  },
                  lineInterpolation: 'smooth',
                  lineWidth: 1,
                  pointSize: 5,
                  scaleDistribution: {
                    type: 'linear',
                  },
                  showPoints: 'never',
                  spanNulls: true,
                  stacking: {
                    group: 'A',
                    mode: 'none',
                  },
                  thresholdsStyle: {
                    mode: 'off',
                  },
                },
                decimals: 2,
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'percent',
              },
              overrides: [
                {
                  matcher: {
                    id: 'byName',
                    options: 'avg1',
                  },
                  properties: [
                    {
                      id: 'custom.axisPlacement',
                      value: 'right',
                    },
                    {
                      id: 'custom.axisLabel',
                      value: 'Loadavg',
                    },
                    {
                      id: 'unit',
                      value: 'short',
                    },
                  ],
                },
              ],
            },
            gridPos: {
              h: 9,
              w: 12,
              x: 0,
              y: 14,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            pluginVersion: '8.2.5',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "cpu"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> map(fn: (r) => ({\n        r with\n        _time: r._time,\n        _value: float(v: r._value) * float(v: 100)\n      })\n    )\n',
                refId: 'A',
              },
              {
                datasource: '$datasource',
                hide: false,
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "wait"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> map(fn: (r) => ({\n        r with\n        _time: r._time,\n        _value: float(v: r._value) * float(v: 100)\n      })\n    )\n  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)',
                refId: 'B',
              },
              {
                datasource: '$datasource',
                hide: false,
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop:v.timeRangeStop)\n  |> filter(fn: (r) =>\n    r._measurement == "cpustat" and\n    r._field == "avg1"\n  )\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)',
                refId: 'C',
              },
            ],
            title: 'Host CPU usage',
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: 'Memory',
                  axisPlacement: 'auto',
                  barAlignment: 0,
                  drawStyle: 'line',
                  fillOpacity: 10,
                  gradientMode: 'hue',
                  hideFrom: {
                    legend: false,
                    tooltip: false,
                    viz: false,
                  },
                  lineInterpolation: 'smooth',
                  lineStyle: {
                    fill: 'solid',
                  },
                  lineWidth: 1,
                  pointSize: 5,
                  scaleDistribution: {
                    type: 'linear',
                  },
                  showPoints: 'never',
                  spanNulls: true,
                  stacking: {
                    group: 'A',
                    mode: 'none',
                  },
                  thresholdsStyle: {
                    mode: 'off',
                  },
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
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'bytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 9,
              w: 12,
              x: 12,
              y: 14,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            pluginVersion: '8.2.5',
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "memory")\n  |> filter(fn: (r) => r["_field"] == "memtotal" or r["_field"] == "memused")\n  |> filter(fn: (r) => r["host"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> yield(name: "mean")',
                refId: 'A',
              },
            ],
            title: 'Host Memory',
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 0,
              y: 23,
            },
            options: {
              legend: {
                calcs: [
                  'last',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "cpu")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'VM CPU usage',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                    mode: 'off',
                  },
                },
                mappings: [],
                max: 100,
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'percent',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 12,
              y: 23,
            },
            options: {
              legend: {
                calcs: [
                  'last',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'mem = from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "mem")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n\nmaxmem = from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "maxmem")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n\njoin(\n    tables: {mem:mem, maxmem:maxmem},\n    on: ["_time","_stop","_start","host"]\n\n)\n\n|> map(fn: (r) => ({\n      _time: r._time,\n      _value: float(v:r._value_mem) / float(v:r._value_maxmem) * float(v:100),\n      host: r.host\n    })\n  )\n\n|> group(columns: ["host"])',
                refId: 'A',
              },
            ],
            title: 'VM memory usage',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
                  lineWidth: 1,
                  pointSize: 5,
                  scaleDistribution: {
                    type: 'linear',
                  },
                  showPoints: 'never',
                  spanNulls: false,
                  stacking: {
                    group: 'A',
                    mode: 'none',
                  },
                  thresholdsStyle: {
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 0,
              y: 31,
            },
            options: {
              legend: {
                calcs: [
                  'last',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "cpu")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'LXC CPU usage',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                    mode: 'off',
                  },
                },
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'percent',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 12,
              y: 31,
            },
            options: {
              legend: {
                calcs: [
                  'last',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'mem = from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "mem")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n\nmaxmem = from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "maxmem")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n\njoin(\n    tables: {mem:mem, maxmem:maxmem},\n    on: ["_time","_stop","_start","host"]\n\n)\n\n|> map(fn: (r) => ({\n      _time: r._time,\n      _value: float(v:r._value_mem) / float(v:r._value_maxmem) * float(v:100),\n      host: r.host\n    })\n  )\n\n|> group(columns: ["host"])',
                refId: 'A',
              },
            ],
            title: 'LXC memory usage',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'Bps',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 0,
              y: 39,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "diskread")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'VM I/O Read',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'Bps',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 12,
              y: 39,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "diskwrite")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'VMs I/O Write',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'Bps',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 0,
              y: 47,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "diskread")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'LXC I/O Read',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'Bps',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 12,
              y: 47,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "diskwrite")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'LXC I/O Write',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'decbytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 0,
              y: 55,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "netin")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s, nonNegative: true)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'VM traffic In',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'decbytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 12,
              y: 55,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "netout")\n  |> filter(fn: (r) => r["object"] == "qemu")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s, nonNegative: true)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'VM traffic out',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'decbytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 0,
              y: 63,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "netin")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s, nonNegative: true)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'LXC traffic In',
            transformations: [],
            type: 'timeseries',
          },
          {
            datasource: '$datasource',
            fieldConfig: {
              defaults: {
                color: {
                  mode: 'palette-classic',
                },
                custom: {
                  axisLabel: '',
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
                  lineInterpolation: 'smooth',
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
                    mode: 'off',
                  },
                },
                displayName: '${__field.labels.host}',
                mappings: [],
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                unit: 'decbytes',
              },
              overrides: [],
            },
            gridPos: {
              h: 8,
              w: 12,
              x: 12,
              y: 63,
            },
            options: {
              legend: {
                calcs: [
                  'lastNotNull',
                ],
                displayMode: 'table',
                placement: 'bottom',
              },
              tooltip: {
                mode: 'single',
              },
            },
            targets: [
              {
                datasource: '$datasource',
                query: 'from(bucket: "${bucket}")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "system")\n  |> filter(fn: (r) => r["_field"] == "netout")\n  |> filter(fn: (r) => r["object"] == "lxc")\n  |> filter(fn: (r) => r["_value"] > 0)\n  |> filter(fn: (r) => r["nodename"] == "${server}")\n  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |> derivative(unit: 1s, nonNegative: true)\n//  |> yield(name: "mean")\n',
                refId: 'A',
              },
            ],
            title: 'LXC traffic out',
            transformations: [],
            type: 'timeseries',
          },
        ],
      },
  },
}
