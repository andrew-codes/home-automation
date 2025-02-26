import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import { unlink } from "fs/promises"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  try {
    await unlink("/tmp/kube-prometheus")
  } catch (e) {}

  const kubeConfig = (await configurationApi.get("k8s/config")).value
  sh.env["KUBECONFIG"] = kubeConfig
  throwIfError(
    sh.exec(
      `git clone https://github.com/prometheus-operator/kube-prometheus.git /tmp/kube-prometheus;`,
    ),
  )
  throwIfError(
    sh.exec(`git checkout release-0.13`, { cwd: "/tmp/kube-prometheus" }),
  )
  throwIfError(
    sh.exec(`kubectl apply -f /tmp/kube-prometheus/manifests/setup;`),
  )
  throwIfError(
    sh.exec(
      `until kubectl get servicemonitors --all-namespaces ; do date; sleep 1; echo ""; done;`,
    ),
  )
  throwIfError(sh.exec("rm -rf /tmp/kube-prometheus/manifests/grafana*.yaml"))
  throwIfError(sh.exec(`kubectl apply -f /tmp/kube-prometheus/manifests/;`))
}

export default run
