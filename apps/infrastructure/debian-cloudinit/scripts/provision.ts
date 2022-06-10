import type { ConfigurationApi } from "@ha/configuration-api"
import type { Configuration } from "@ha/configuration-workspace"
import { throwIfError } from "@ha/shell-utils"
import sh from "shelljs"

const run = async (
  configurationApi: ConfigurationApi<Configuration>,
): Promise<void> => {
  const pveHost = await configurationApi.get("proxmox/ip")
  const pveUsername = await configurationApi.get("proxmox/username")
  const username = pveUsername.split("@")[0]

  sh.exec(`
  ssh -i ~/.ssh/proxmox ${username}@${pveHost} '
    qm destroy 9000;
'`)

  throwIfError(
    sh.exec(`
    ssh -i ~/.ssh/proxmox ${username}@${pveHost} '
      set -e;
      [ ! -f debian-11-generic-amd64.qcow2 ] && wget https://cdimage.debian.org/images/cloud/bullseye/latest/debian-11-generic-amd64.qcow2;
      qm create 9000 -name debian-11-template -memory 1024 -net0 virtio,bridge=vmbr0 -cores 2 -sockets 1 -cpu cputype=kvm64 -description "Debian 11 cloud image" -kvm 1 -numa 1;
      qm importdisk 9000 debian-11-generic-amd64.qcow2 local-lvm;
      qm set 9000 -scsihw virtio-scsi-pci -virtio0 local-lvm:vm-9000-disk-0;
      qm set 9000 -serial0 socket;
      qm set 9000 -boot c -bootdisk virtio0;
      qm set 9000 -agent 1;
      qm set 9000 -hotplug disk,network,usb,memory,cpu;
      qm set 9000 -vcpus 1;
      qm set 9000 -vga qxl;
      qm set 9000 -name debian-11-template;
      qm set 9000 -ide2 local-lvm:cloudinit;
      qm template 9000;
      # qm set 9000 -sshkey /etc/pve/pub_keys/pub_key.pub;
'`),
  )
}

export default run
