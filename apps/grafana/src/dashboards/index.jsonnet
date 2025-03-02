local proxmox = import "./proxmox.jsonnet";

{
  proxmox: {
    json: std.toString(
      proxmox,
    ),
  },
}
