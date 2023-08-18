import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  throwIfError(
    sh.exec(
      `helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/`,
    ),
  )

  const nfsIp = await configurationApi.get("nfs/ip")
  const nfsSharePath = await configurationApi.get("nfs/share-path")
  throwIfError(
    sh.exec(
      `helm install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner --set nfs.server=${nfsIp.value} --set nfs.path=${nfsSharePath.value} --set storageClass.name=nfs-client --set storageClass.accessMode=ReadWriteMany`,
    ),
  )
}

export default run
