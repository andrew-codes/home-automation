{
  apiVersion: "operator.victoriametrics.com/v1beta1",
  kind: "VMUser",
  metadata: {
    name: "readOnly",
  },
  spec: {
    bearerToken: std.extVar("readOnlyToken"),
    urlPathPrefix: "/select/",
    isDisabled: false,
  },
}
