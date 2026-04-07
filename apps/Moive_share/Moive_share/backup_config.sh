#!/bin/bash

# Configuration
BACKUP_DIR="$HOME/Moive_share/data/local/backups"
CONFIG_DIR="$HOME/Moive_share/config"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="config_backup_$TIMESTAMP.zip"

echo "📦 Starting configuration backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create zip
zip -r "$BACKUP_DIR/$BACKUP_FILE" "$CONFIG_DIR" -x "*.db-shm" -x "*.db-wal" -x "*.pid" -x "*.db-journal"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Optional: Upload to Google Drive via Rclone
    # echo "☁️  Uploading to Google Drive..."
    # rclone copy "$BACKUP_DIR/$BACKUP_FILE" gcrypt:backups/
else
    echo "❌ Backup failed!"
    exit 1
fi

# Cleanup old backups (keep last 5)
cd "$BACKUP_DIR" && ls -t | tail -n +6 | xargs rm -f -- 2>/dev/null

echo "🏁 Backup process complete."
