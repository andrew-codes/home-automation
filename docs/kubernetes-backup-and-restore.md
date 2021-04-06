# Cluster Backup and Restore

## Daily Backup

To set up a daily backup that is stored for a maximum of 5 days (5-day rolling backup), execute the following:

```bash
./ansible.sh ansible/k8s/backup-schedule.yml
```

## Restore

Find the backup you wish to restore by logging into Azure and looking in the Velero storage blob container. Backups are located in `./backups/daily-backup-$TIMESTAMP`

SSH into the cluster machine. To restore:

```bash
# Replace timestamp with correct timestamp value from looking up the backup name.
BACKUP_NAME="daily-backup-$TIMESTAMP"

velero restore create --from-backup $BACKUP_NAME
```
