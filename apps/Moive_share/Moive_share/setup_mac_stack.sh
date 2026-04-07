#!/bin/bash

echo "🚀 Starting Media Stack Setup for Mac (Silicon)..."

# 1. Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is missing. Please install it first from https://brew.sh"
    exit 1
fi

# 2. Install Dependencies
echo "📦 Installing applications via Homebrew..."
brew install --cask docker
brew install --cask jellyfin
brew install --cask in-t
brew install rclone

echo "✅ Apps installed."

# 3. Create Directories
echo "📂 Creating folder structure..."
MEDIA_ROOT="$HOME/Moive_share"
mkdir -p "$MEDIA_ROOT/data/local"
mkdir -p "$MEDIA_ROOT/data/cloud"
mkdir -p "$MEDIA_ROOT/config"

echo "✅ Folders ready at $MEDIA_ROOT"

# 4. Instructions for Rclone
echo "
=========================================================
⚠️  CRITICAL STEP: GOOGLE DRIVE SETUP  ⚠️
=========================================================
You must now link your Google Drive. 

1. Open a new terminal.
2. Run: rclone config
3. Follow these steps:
   - n (New remote)
   - Name: gdrive
   - Storage: drive (Google Drive)
   - Client ID: Leave blank (or use your own if you have one)
   - Client Secret: Leave blank
   - Scope: 1 (Full access)
   - Service Account: Leave blank
   - Edit advanced config: n
   - Web browser auth: y (Follow the login prompt)

4. AFTER 'gdrive' is created, create the ENCRYPTED remote:
   - n (New remote)
   - Name: gcrypt
   - Storage: crypt (Encrypt/Decrypt a remote)
   - Remote: gdrive:/media_encrypted
   - Filename Encryption: standard
   - Directory Name Encryption: true
   - Password: [CREATE A STRONG PASSWORD AND SAVE IT]

Once done, run the 'start_cloud_mount.sh' script I created.
=========================================================
"
