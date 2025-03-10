# Converted/Automated Projects

- [ ] alexa
- [ ] captive-portal
- [ ] cert-manager
- [x] cloudflared
- [ ] coder
- [x] docker-creds
- [x] docker-registry-service
- [x] docker-registry
- [ ] frigate
- [ ] gaming-pc
- [ ] github-action-runners
- [ ] gpu-scheduler
- [ ] guest-db
- [ ] guest-pin-codes
- [ ] guest-wifi-registrar
- [ ] guest-wifi-renewal
- [x] home-assistant
- [x] k8s
- [ ] manual-deployment
- [x] metrics
- [x] mqtt
- [x] nfs-provisioner
- [ ] paperless
- [ ] photoprism
- [x] pihole-service
- [x] pihole
- [x] playnite-web-app
- [x] ps5
- [x] pve-service
- [x] secrets
- [x] tailscale
- [x] ubuntu-cloud-template
- [ ] uptime-kuma
- [x] wake-on-lan
- [x] zwavejs

## Notes on What's Next

- [x] use ghcr.io for registry; deprecate docker-registry
- [ ] global configure of terraform state shared with CI agents
- [ ] re-apply implicit deps to all apps
- [x] prefix repo name to all packaged and published images
- [ ] automate pihole conditional forwarding
- [x] enable cross-platform building of docker images
- [ ] document or automate the setup of multi-platform docker builders for dev machine
- [x] tunnel services do not work with piholes enabled
- [x] nfs pvc creation does not require an IP, remove from libsonnet function API
- [x] nfs pvc creation name excludes pvc suffix
- [ ] enable onepassword connect to be favored over CLI
- [x] k8s cluster should not delete `/run/flannel/subnet.env` on restart of container
- [x] cloudflared should not error and be able to resolve requests.
- [x] cloudflared should automatically add dns entries to cloudflare dns
- [x] cloudflared should create tunnel if no tunnel id exists.
- [x] observability app
- [x] configure grafana username and password when deploying
- [x] configure grafana proxmox dashboard auto generation on deployment
