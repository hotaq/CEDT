# Agent Guide: Media Share Stack (macOS Hybrid)

This repository contains the Infrastructure-as-Code (IaC) and automation scripts for a high-performance media server stack on macOS (Apple Silicon).
It uses a **Hybrid Architecture**: Native macOS apps for performance (Jellyfin) and Docker for automation (*arr stack).

## 1. Project Context & Architecture

### **Critical Architectural Decisions (DO NOT CHANGE WITHOUT REASON)**
*   **Hybrid Approach**:
    *   **Jellyfin**: Runs **NATIVELY** on macOS.
        *   *Reason*: Docker on macOS cannot access Apple Silicon (M1/M2/M3) VideoToolbox for hardware transcoding. Running inside Docker forces software transcoding (CPU spike).
    *   **Automation (*arrs)**: Runs in **Docker**.
        *   *Reason*: Better networking isolation (VPN), easier dependency management, lighter updates.
*   **Storage Strategy (Cloud Playout)**:
    *   **Rclone Mount**: Google Drive is mounted via FUSE-T.
    *   **Atomic Moves Simulation**:
        *   Downloads happen to `data/local` (SSD).
        *   Sonarr/Radarr "move" files to `data/cloud` (Mount).
        *   Rclone VFS Cache captures this instantly ("Atomic" from app perspective) and uploads in background.
*   **VPN Routing**:
    *   `gluetun` container acts as the network gateway.
    *   `qbittorrent` and `prowlarr` MUST route through `service:gluetun`.

## 2. Operational Commands

### **Docker Management**
*   **Start Stack**:
    ```bash
    cd Moive_share
    docker compose up -d
    ```
*   **Stop Stack**:
    ```bash
    docker compose down
    ```
*   **View Logs** (Essential for debugging VPN connection):
    ```bash
    docker compose logs -f gluetun
    docker compose logs -f qbittorrent
    ```
*   **Validate Config**:
    ```bash
    docker compose config
    ```

### **Script Execution**
*   **Install Dependencies** (Idempotent):
    ```bash
    ./Moive_share/setup_mac_stack.sh
    ```
*   **Mount Cloud Drive**:
    ```bash
    ./Moive_share/start_cloud_mount.sh
    ```

### **Testing & Linting**
*   **Bash Syntax Check**:
    ```bash
    bash -n Moive_share/setup_mac_stack.sh
    bash -n Moive_share/start_cloud_mount.sh
    ```
*   **Verify Rclone Config**:
    ```bash
    rclone config show
    # Ensure 'gcrypt' and 'gdrive' exist
    ```

## 3. Code Style & Standards

### **Bash Scripts (.sh)**
*   **Shebang**: Always use `#!/bin/bash`.
*   **Safety**:
    *   Quote all variables: `"$VAR"` to handle spaces in paths (common in macOS).
    *   Check for dependencies before running (e.g., `command -v docker`).
    *   Use explicit exit codes on failure.
*   **Feedback**:
    *   Use emojis (🚀, 📦, ✅) in `echo` statements to guide non-technical users.
    *   Print clear, bordered sections for critical manual steps (like Auth flows).
*   **Permissions**: Ensure scripts are executable (`chmod +x`).

### **Docker Compose (YAML)**
*   **Image Tags**:
    *   Use specific tags where possible, or `:latest` for `linuxserver.io` images as they are rolling.
    *   Prefer `lscr.io/linuxserver/...` for consistency (UID/GID handling).
*   **Naming**:
    *   Explicitly set `container_name` to match the service name.
*   **Networking**:
    *   Use `network_mode: "service:gluetun"` for any container interacting with public trackers.
*   **Volumes**:
    *   Use relative paths: `./data:/data`.
    *   **TRaSH Guides Convention**: Map a single `/data` volume containing both `downloads` and `media` subfolders to allow atomic moves (even if simulated via Rclone).

### **Directory Structure Convention**
The repository MUST maintain this structure to ensure Docker volume mappings align:

```text
Moive_share/
├── config/              # Persistent app data (Databases, metadata)
│   ├── sonarr/
│   ├── radarr/
│   └── ...
├── data/
│   ├── local/           # Fast SSD scratch space for downloads
│   └── cloud/           # Rclone mount point (Google Drive)
├── docker-compose.yml   # Orchestration
└── *.sh                 # Automation scripts
```

## 4. Configuration Rules

### **User Permissions (PUID/PGID)**
*   **macOS Standard**:
    *   User ID (`PUID`): `501` (First Mac user).
    *   Group ID (`PGID`): `20` (Staff).
*   **Do NOT** use `1000:1000` (Linux standard) as it causes permission issues on macOS bind mounts.

### **Rclone Flags (Performance)**
When modifying `start_cloud_mount.sh`, PRESERVE these flags:
*   `--vfs-cache-mode full`: Essential for seeking and atomic moves.
*   `--vfs-cache-max-size`: Keep reasonable (50G-100G) to avoid filling the Mac SSD.
*   `--poll-interval 15s`: Fast updates for new content.

## 5. Error Handling & Debugging

*   **"Read-only file system" errors**:
    *   Usually means the Docker volume mount is misconfigured or Rclone isn't running.
    *   *Check*: Is `start_cloud_mount.sh` active?
*   **"Permission denied"**:
    *   Check `PUID=501` in `docker-compose.yml`.
    *   Ensure `Moive_share/config` is owned by the user.
*   **VPN Connection Failed**:
    *   Check `gluetun` logs.
    *   Verify `OPENVPN_USER` and `OPENVPN_PASSWORD` in compose file.

## 6. Future Agents: Task List
If asked to improve the stack:
1.  [ ] Add a `.env` file generator to stop hardcoding credentials in `docker-compose.yml`.
2.  [ ] Add a "Healthcheck" script that pings the Sonarr/Radarr APIs.
3.  [ ] Create a backup script for the `config/` directory (upload zip to GDrive).


## 7. Current Project Status (Checkpoint: Sat Jan 24 19:35:00 +07 2026)

### Accomplished
- [x] **Architecture**: "Hybrid Stack" defined (Native Jellyfin + Docker Automation).
- [x] **Storage**: Google Drive mounted via Rclone + FUSE-T (encrypted).
- [x] **VPN**: Gluetun (ProtonVPN) configured and successfully connected (TCP mode).
- [x] **Authentication**:
    - ProtonVPN OpenVPN credentials moved to `.env` file.
    - qBittorrent unbanned and user logged in.
- [x] **Directory Structure**: Validated `~/Moive_share/data/cloud` and `~/Moive_share/data/local`.
- [x] **Automation**:
    - Created `.env` file for centralized credential management.
    - Created `check_health.sh` for stack status monitoring.
    - Created `backup_config.sh` for configuration backups.
- [x] **qBittorrent Config**:
    - [x] Set "Default Save Path" to `/data/local`.
    - [x] Disable UPnP.

### Pending Configuration Steps
1.  **Sonarr/Radarr Connection (Manual UI Steps Required)**:
    - [ ] Connect Download Client (Host: `gluetun`, Port: `8080`).
    - [ ] Set Root Folder to `/data/cloud`.
2.  **Prowlarr Sync (Manual UI Steps Required)**:
    - [ ] Add Indexers (1337x, RARBG).
    - [ ] Sync App Profiles to Sonarr/Radarr.
3.  **Jellyfin Setup (Manual UI Steps Required)**:
    - [ ] Point library to `/Users/chinnphats/Moive_share/data/cloud`.

### Critical Context for Future Agents
- **VPN**: Running in **TCP** mode to avoid packet loss errors.
- **Rclone**: Using **Official Binary** (not Homebrew) to support mounting.
- **API Keys**: Stored in `.env` for use by health check scripts.
