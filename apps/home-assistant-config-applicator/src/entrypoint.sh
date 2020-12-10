#!/usr/bin/env bash

GIT_REMOTE=origin

#### functions ####
function add-ssh-key() {
    echo "[Info] Start adding SSH key"
    mkdir -p ~/.ssh

    (
        echo "Host *"
        echo "    StrictHostKeyChecking no"
    ) >~/.ssh/config

    chmod 600 "${HOME}/.ssh/config"
}

function git-clone() {
    # create backup
    BACKUP_LOCATION="/tmp/config-$(date +%Y-%m-%d_%H-%M-%S)"
    echo "[Info] Backup configuration to $BACKUP_LOCATION"

    mkdir -p "${BACKUP_LOCATION}" || {
        echo "[Error] Creation of backup directory failed"
        exit 1
    }
    cp -rf /config/* "${BACKUP_LOCATION}" && rm -rf /config/{,.[!.],..?}* || {
        echo "[Error] Backup failed"
    }

    # git clone
    echo "[Info] Start git clone"
    git clone --depth 1 --filter=blob:none --no-checkout $REPOSITORY /config || {
        echo "[Error] Git clone failed"
        exit 1
    }
    # try to copy non yml files back
    cp "${BACKUP_LOCATION}" "!(*.yaml)" /config 2>/dev/null
}

function check-ssh-key() {
    echo "Check SSH connection"
    IFS=':' read -ra GIT_URL_PARTS <<<"$REPOSITORY"
    # shellcheck disable=SC2029
    DOMAIN="${GIT_URL_PARTS[0]}"
    if OUTPUT_CHECK=$(ssh -T -o "StrictHostKeyChecking=no" -o "BatchMode=yes" "$DOMAIN" 2>&1) || { [[ $DOMAIN = *"@github.com"* ]] && [[ $OUTPUT_CHECK = *"You've successfully authenticated"* ]]; }; then
        echo "[Info] Valid SSH connection for $DOMAIN"
    else
        echo "[Warn] No valid SSH connection for $DOMAIN"
        add-ssh-key
    fi
}

function git-synchronize() {
    if git rev-parse --is-inside-work-tree &>/dev/null; then
        echo "[Info] Local git repository exists"

        # Is the local repo set to the correct origin?
        CURRENTGITREMOTEURL=$(git remote get-url --all "$GIT_REMOTE" | head -n 1)
        # if [ "$CURRENTGITREMOTEURL" = "$REPOSITORY" ]; then
        echo "[Info] Git origin is correctly set to $REPOSITORY"
        OLD_COMMIT=$(git rev-parse HEAD)

        # Always do a fetch to update repos
        echo "[Info] Start git fetch..."
        git fetch "$GIT_REMOTE" || {
            echo "[Error] Git fetch failed"
            return 1
        }

        # Prune if configured
        if [ "$GIT_PRUNE" == "true" ]; then
            echo "[Info] Start git prune..."
            git prune || {
                echo "[Error] Git prune failed"
                return 1
            }
        fi

        # Do we switch branches?
        GIT_CURRENT_BRANCH=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)
        if [ -z "$GIT_BRANCH" ] || [ "$GIT_BRANCH" == "$GIT_CURRENT_BRANCH" ]; then
            echo "[Info] Staying on currently checked out branch: $GIT_CURRENT_BRANCH..."
        else
            echo "[Info] Switching branches - start git checkout of branch $GIT_BRANCH..."
            git checkout "$GIT_BRANCH" || {
                echo "[Error] Git checkout failed"
                exit 1
            }
            GIT_CURRENT_BRANCH=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)
        fi

        echo "[Info] Start git reset to $GIT_REMOTE on branch $GIT_BRANCH..."
        git reset --hard "$GIT_REMOTE" "$GIT_BRANCH" || {
            echo "[Error] Git reset --hard in /home-automation failed"
            return 1
        }
        # else
        #     echo "[Error] git origin does not match $REPOSITORY!"
        #     exit 1
        # fi

    else
        echo "[Warn] Git repostory doesn't exist"
        git-clone
    fi
}

function validate-config() {
    echo "[Info] Checking if something has changed..."
    # Compare commit ids & check config
    NEW_COMMIT=$(git rev-parse HEAD)
    if [ "$NEW_COMMIT" != "$OLD_COMMIT" ]; then
        echo "[Info] Something has changed, checking Home-Assistant config..."
        if ha --no-progress core check; then
            echo "Config validation was successful."
        else
            echo "[Error] Configuration updated but it does not pass the config check. Do not restart until this is fixed!"
            # TODO: rollback to previous commit???
        fi
    else
        echo "[Info] Nothing has changed."
    fi
}

###################

#### Main program ####
cd /config || {
    echo "[Error] Failed to cd into /config"
    exit 1
}

check-ssh-key
if git-synchronize; then
    validate-config
fi

###################
