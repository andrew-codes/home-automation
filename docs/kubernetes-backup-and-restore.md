# Cluster Backup and Restore

## Daily Backup

To setup a daily backup that is stored for a maximum of 5 days (5 day rolling backup), execute the following:

```bash
./ansible.sh ansible/k8s/backup-schedule.yml
```

## Restore

SSH into the cluster machine. Find the restore via:

```bash
velero restore get
```

To restore:

```bash
velero restore create --from-backup $BACKUP_NAME
```
