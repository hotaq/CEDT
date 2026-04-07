#!/bin/bash

# Configuration
MOUNT_POINT="$HOME/Moive_share/data/cloud"
REMOTE_NAME="gcrypt:" # Matches the name in setup instructions

echo "☁️  Mounting Google Drive to $MOUNT_POINT..."

# Check if already mounted
if mount | grep -q "$MOUNT_POINT"; then
    echo "✅ Already mounted."
    exit 0
fi

# Mount command with VFS Cache (Critical for streaming)
rclone mount "$REMOTE_NAME" "$MOUNT_POINT" \
    --volname "GoogleDriveMedia" \
    --vfs-cache-mode full \
    --vfs-cache-max-size 50G \
    --vfs-read-chunk-size 32M \
    --allow-other \
    --daemon

echo "✅ Mount command sent. Check folder in Finder."
