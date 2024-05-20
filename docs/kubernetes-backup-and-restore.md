# Cluster Backup and Restore

The velero CLI tool is installed in the dev container and may be used to perform backups and restores.

## Example Rolling 7 Day Backup of Home-Automation Namespace

```bash
export NAMESPACE="home-automation"

velero schedule create home-automation-daily-backup --schedule "0 7 * * *" --ttl "720h" --include-namespaces $NAMESPACE
```

## Restore

Find the backup you wish to restore by logging into Azure and looking in the Velero storage blob container. Backups are located in `./backups/daily-backup-$TIMESTAMP`

### Find a Backup

```bash
velero backup get
```

### Restore Backup

```bash
# Replace timestamp with correct timestamp value from looking up the backup name.
export BACKUP_NAME="daily-backup-$TIMESTAMP"

velero restore create --from-backup $BACKUP_NAME
```
