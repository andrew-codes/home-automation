# OpenVPN Access Server

# Provision OpenVPN AS

```bash
yarn provision openvpn-as prod.env
```

Follow this [guide](https://ryanburnette.com/blog/proxmox-openvpn-access-server/) to set options on the LXC container:

```
lxc.cgroup.devices.allow = c 10:200 rwm
lxc.hook.autodev = sh -c "modprobe tun; cd ${LXC_ROOTFS_MOUNT}/dev; mkdir net; mknod net/tun c 10 200; chmod 0666 net/tun"
```

and update the permissions on the Proxmox Host:

```bash
chown 100000:100000 /dev/net/tun
```

## Initialize and Set Secrets

```bash
yarn initialize-secrets --scope @ha/openvpn-as
```

> Set secrets via the Vault UI.

## Deploy

```bash
yarn deploy --scope @ha/openvpn-as
```

## Sign into OpenVPN AS

Navigate to `https://{PROD_VPN_IP}:943/admin` and sign in with `openvpn` and the password secret set above.
