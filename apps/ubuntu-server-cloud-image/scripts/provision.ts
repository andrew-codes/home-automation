import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const pveHost = await configurationApi.get("proxmox/ip")
  const pveUsername = await configurationApi.get("proxmox/username")
  const username = pveUsername.value.split("@")[0]

  sh.exec(
    `
  ssh -i ~/.ssh/proxmox ${username}@${pveHost.value} '
    qm destroy 9000;
'`,
    { silent: true },
  )

  await throwIfError(
    sh.exec(
      `
    ssh -i ~/.ssh/proxmox ${username}@${pveHost.value} '
      set -e;
      [ ! -f noble-server-cloudimg-amd64.img ] && wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img;
      qm create 9000 -name ubuntu-server-template -memory 1024 -net0 virtio,bridge=vmbr0 -cores 2 -sockets 1 -cpu cputype=kvm64 -description "Ubuntu 22.04 server cloud image" -kvm 1 -numa 1;
      qm importdisk 9000 noble-server-cloudimg-amd64.img local-lvm;
      qm set 9000 -scsihw virtio-scsi-pci -scsi0 local-lvm:vm-9000-disk-0;
      qm set 9000 --boot order=scsi0;
      qm set 9000 -hotplug disk,network,usb,memory,cpu;
      qm set 9000 -vcpus 1;
      qm set 9000 -vga qxl;
      qm set 9000 -name ubuntu-server-template;
      qm set 9000 -ide2 local-lvm:cloudinit;
      qm template 9000;
'`,
      { silent: true },
    ),
  )
}

export default run
