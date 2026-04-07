/// iOS device discovery and metadata retrieval via `idevice` + `usbmuxd`.
///
/// Connects to the macOS `usbmuxd` daemon, enumerates USB iOS devices,
/// fetches device name/iOS-version from `lockdownd`, and returns a
/// concrete `UsbmuxdProvider` that other services (e.g. syslog_relay) share.
use anyhow::{anyhow, Context, Result};
use idevice::pairing_file::PairingFile;
use idevice::provider::UsbmuxdProvider;
use idevice::services::lockdown::LockdownClient;
use idevice::usbmuxd::{UsbmuxdAddr, UsbmuxdConnection};
use idevice::IdeviceService;

// ──────────────────────────────────────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct IosDevice {
    pub name: String,
    pub ios_version: String,
    pub udid: String,
}

// ──────────────────────────────────────────────────────────────────────────────
// Core function
// ──────────────────────────────────────────────────────────────────────────────

/// Connect to the first USB iOS device found, then return the device metadata
/// and a `UsbmuxdProvider` that can be reused to open further services.
///
/// # Errors
/// - No iOS device is plugged in / not trusted.
/// - No pairing record — the user must accept "Trust This Computer" first.
pub async fn connect() -> Result<(IosDevice, UsbmuxdProvider, PairingFile)> {
    // 1. Connect to usbmuxd ───────────────────────────────────────────────────
    let mut muxd = UsbmuxdConnection::default()
        .await
        .context(
            "Cannot reach usbmuxd. Make sure a USB cable is connected \
             and macOS recognises the device.",
        )?;

    // 2. Enumerate devices (async in 0.1.53) ──────────────────────────────────
    let devices = muxd
        .get_devices()
        .await
        .context("Failed to list devices from usbmuxd")?;

    if devices.is_empty() {
        return Err(anyhow!(
            "No iOS device detected.\n\n\
             Make sure:\n\
             • A physical iOS device is connected via USB.\n\
             • The device is unlocked and you have tapped \"Trust This Computer\".\n\
             • usbmuxd is running (it starts automatically on macOS)."
        ));
    }

    let dev = &devices[0];
    let udid = dev.udid.clone();

    // 3. Fetch the pairing record from usbmuxd ──────────────────────────────
    let pairing_file = muxd
        .get_pair_record(&udid)
        .await
        .context(
            "No pairing record found for this device.\n\n\
             Run: idevicepair pair\n\
             Then unlock your device and tap \"Trust This Computer\".",
        )?;

    // 4. Build a provider ─────────────────────────────────────────────────────
    let addr = UsbmuxdAddr::from_env_var().unwrap_or_default();
    let provider = dev.to_provider(addr, "thermeye");

    // 5. Open lockdownd and start a trusted session ───────────────────────────
    let mut lockdown = LockdownClient::connect(&provider)
        .await
        .context("Could not open lockdownd. Is the device trusted?")?;

    lockdown
        .start_session(&pairing_file)
        .await
        .context(
            "Lockdown session failed — pairing record may be stale.\n\
             Try: idevicepair pair",
        )?;

    // 6. Fetch device values ──────────────────────────────────────────────────
    // get_value signature: (key: Option<&str>, domain: Option<&str>)
    let device_name = lockdown
        .get_value(Some("DeviceName"), None)
        .await
        .ok()
        .and_then(|v: plist::Value| v.into_string())
        .unwrap_or_else(|| "Unknown Device".to_string());

    let ios_version = lockdown
        .get_value(Some("ProductVersion"), None)
        .await
        .ok()
        .and_then(|v: plist::Value| v.into_string())
        .unwrap_or_else(|| "?.?.?".to_string());

    let device = IosDevice {
        name: device_name,
        ios_version,
        udid,
    };

    Ok((device, provider, pairing_file))
}
