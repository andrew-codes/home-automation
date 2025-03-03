import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { kubectl } from "@ha/kubectl"
import { logger } from "@ha/logger"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const kubeConfig = (await configurationApi.get("k8s/config")).value
  const kube = kubectl(kubeConfig)

  await kube.exec(
    `helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/`,
  )

  const output = await kube.exec(`helm list -q -n default`)
  if (output.includes("nfs-subdir-external-provisioner")) {
    kube.exec(`helm uninstall nfs-subdir-external-provisioner`)
  }

  const nfsIp = await configurationApi.get("nfs/ip")
  const nfsSharePath = await configurationApi.get("nfs/share-path")
  kube.exec(
    `helm install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner --set nfs.server=${nfsIp.value} --set nfs.path=${nfsSharePath.value} --set storageClass.name=nfs --set storageClass.accessMode=ReadWriteMany`,
  )

  logger.info("Waiting for nfs-subdir-external-provisioner to be ready")
  await new Promise((resolve) => setTimeout(resolve, 10000))
}

export default run
