/// Async syslog relay streaming task.
///
/// Opens the iOS `syslog_relay` service through the `UsbmuxdProvider`,
/// then reads log lines in a tight async loop, forwarding each line
/// to the caller via a `tokio::sync::mpsc` channel.
use anyhow::{Context, Result};
use idevice::pairing_file::PairingFile;
use idevice::provider::UsbmuxdProvider;
use idevice::services::lockdown::LockdownClient;
use idevice::services::syslog_relay::SyslogRelayClient;
use idevice::IdeviceService;
use tokio::sync::mpsc;
use tokio::task::JoinHandle;

/// Spawn a background task that streams the iOS syslog relay.
///
/// Each non-empty log line is sent as a `String` through `tx`.
/// The task exits cleanly when `tx` is dropped or when the device disconnects.
pub async fn start_syslog_stream(
    provider: &UsbmuxdProvider,
    pairing_file: &PairingFile,
    tx: mpsc::Sender<String>,
) -> Result<JoinHandle<()>> {
    // The syslog_relay service requires a fresh lockdown session to start it.
    let mut lockdown = LockdownClient::connect(provider)
        .await
        .context("Could not re-open lockdownd for syslog service")?;

    lockdown
        .start_session(pairing_file)
        .await
        .context("Lockdown session for syslog failed")?;

    // Connect to the syslog_relay service on the device.
    let mut client = SyslogRelayClient::connect(provider)
        .await
        .context(
            "Failed to open syslog_relay service.\n\
             The device must be trusted and have Developer Mode enabled (iOS 16+).",
        )?;

    let handle = tokio::spawn(async move {
        loop {
            match client.next().await {
                Ok(line) => {
                    let line = line.trim().to_string();
                    if line.is_empty() {
                        continue;
                    }
                    // If the receiver has been dropped, stop streaming.
                    if tx.send(line).await.is_err() {
                        break;
                    }
                }
                Err(e) => {
                    // Device disconnected or EOS — exit the loop gracefully.
                    eprintln!("[thermeye] syslog_relay ended: {e:?}");
                    break;
                }
            }
        }
    });

    Ok(handle)
}
