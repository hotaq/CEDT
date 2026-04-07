use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use serde::Serialize;
use std::collections::HashMap;
use std::ffi::{OsStr, OsString};
#[cfg(unix)]
use std::os::unix::ffi::{OsStrExt, OsStringExt};
use std::path::{Component, Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "snake_case")]
enum ErrorCategory {
    Validation,
    Policy,
    Git,
    NotFound,
    Internal,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ApiErrorPayload {
    category: ErrorCategory,
    code: String,
    message: String,
    guidance: Option<String>,
    session_id: Option<String>,
    snapshot_id: Option<u64>,
}

impl ApiErrorPayload {
    fn validation(code: &str, message: &str, guidance: Option<&str>) -> Self {
        Self {
            category: ErrorCategory::Validation,
            code: code.to_string(),
            message: message.to_string(),
            guidance: guidance.map(str::to_string),
            session_id: None,
            snapshot_id: None,
        }
    }

    fn policy(code: &str, message: &str, guidance: Option<&str>) -> Self {
        Self {
            category: ErrorCategory::Policy,
            code: code.to_string(),
            message: message.to_string(),
            guidance: guidance.map(str::to_string),
            session_id: None,
            snapshot_id: None,
        }
    }

    fn git(code: &str, message: &str, guidance: Option<&str>) -> Self {
        Self {
            category: ErrorCategory::Git,
            code: code.to_string(),
            message: message.to_string(),
            guidance: guidance.map(str::to_string),
            session_id: None,
            snapshot_id: None,
        }
    }

    fn not_found(code: &str, message: &str) -> Self {
        Self {
            category: ErrorCategory::NotFound,
            code: code.to_string(),
            message: message.to_string(),
            guidance: None,
            session_id: None,
            snapshot_id: None,
        }
    }

    fn internal(code: &str, message: &str) -> Self {
        Self {
            category: ErrorCategory::Internal,
            code: code.to_string(),
            message: message.to_string(),
            guidance: None,
            session_id: None,
            snapshot_id: None,
        }
    }
}

#[derive(Clone)]
struct SessionEntry {
    repo_root: PathBuf,
    head_ref: Arc<Mutex<Option<String>>>,
    head_oid: Arc<Mutex<Option<String>>>,
    snapshot_id: Arc<AtomicU64>,
    path_index: Arc<Mutex<HashMap<String, Vec<u8>>>>,
    mutation_lock: Arc<Mutex<()>>,
}

#[derive(Default)]
struct AppState {
    sessions: Mutex<HashMap<String, SessionEntry>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GitAvailability {
    available: bool,
    version: Option<String>,
    guidance: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RepoSession {
    session_id: String,
    repo_root: String,
    head_ref: Option<String>,
    head_oid: Option<String>,
    snapshot_id: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenRepoResult {
    requires_init: bool,
    candidate_path: Option<String>,
    session: Option<RepoSession>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct StatusEntry {
    path_display: String,
    path_key: String,
    staged: bool,
    unstaged: bool,
    untracked: bool,
    status_code: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct StatusSnapshot {
    session_id: String,
    snapshot_id: u64,
    staged: Vec<StatusEntry>,
    unstaged: Vec<StatusEntry>,
    untracked: Vec<StatusEntry>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DiffResult {
    patch: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CommitResult {
    session_id: String,
    snapshot_id: u64,
    commit_oid: String,
    summary: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BranchEntry {
    name: String,
    is_active: bool,
    upstream: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HistoryEntry {
    oid: String,
    author_name: String,
    author_email: String,
    date_iso: String,
    subject: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SyncActionResult {
    session_id: String,
    snapshot_id: u64,
    operation: String,
    summary: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct StashEntry {
    stash_ref: String,
    subject: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct StashSaveResult {
    session_id: String,
    snapshot_id: u64,
    stash_ref: Option<String>,
    summary: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BranchCreateResult {
    session_id: String,
    snapshot_id: u64,
    branch: String,
    checked_out: bool,
}

fn guidance_for_git_install() -> String {
    #[cfg(target_os = "macos")]
    {
        return "Install Git with: xcode-select --install, then relaunch Easy Git.".to_string();
    }
    #[cfg(target_os = "windows")]
    {
        return "Install Git for Windows from https://git-scm.com/download/win and relaunch Easy Git.".to_string();
    }
    #[cfg(target_os = "linux")]
    {
        return "Install Git via your package manager (for example: sudo apt install git), then relaunch Easy Git.".to_string();
    }
    #[allow(unreachable_code)]
    "Install Git and ensure it is available on PATH, then relaunch Easy Git.".to_string()
}

fn create_session(state: &AppState, repo_root: PathBuf) -> Result<RepoSession, ApiErrorPayload> {
    let session_id = Uuid::new_v4().to_string();
    let (head_ref, head_oid) = current_head(&repo_root);

    let entry = SessionEntry {
        repo_root: repo_root.clone(),
        head_ref: Arc::new(Mutex::new(head_ref.clone())),
        head_oid: Arc::new(Mutex::new(head_oid.clone())),
        snapshot_id: Arc::new(AtomicU64::new(0)),
        path_index: Arc::new(Mutex::new(HashMap::new())),
        mutation_lock: Arc::new(Mutex::new(())),
    };

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|_| ApiErrorPayload::internal("STATE_POISONED", "Failed to update session map"))?;
    sessions.insert(session_id.clone(), entry);

    Ok(RepoSession {
        session_id,
        repo_root: repo_root.display().to_string(),
        head_ref,
        head_oid,
        snapshot_id: 0,
    })
}

fn canonicalize_repo_candidate(input_path: &str) -> Result<PathBuf, ApiErrorPayload> {
    if input_path.trim().is_empty() {
        return Err(ApiErrorPayload::validation(
            "EMPTY_INPUT_PATH",
            "Repository path is required",
            None,
        ));
    }
    let candidate = PathBuf::from(input_path);
    if !candidate.exists() {
        return Err(ApiErrorPayload::validation(
            "PATH_NOT_FOUND",
            "Selected path does not exist",
            Some("Choose an existing folder path."),
        ));
    }
    if !candidate.is_dir() {
        return Err(ApiErrorPayload::validation(
            "INVALID_REPO_PATH",
            "Selected path must be a directory",
            Some("Choose a folder to open as repository."),
        ));
    }
    candidate.canonicalize().map_err(|_| {
        ApiErrorPayload::validation(
            "INVALID_REPO_PATH",
            "Failed to resolve repository path",
            Some("Choose a folder path that can be resolved on this system."),
        )
    })
}

fn detect_repo_root(path: &Path) -> Result<Option<PathBuf>, ApiErrorPayload> {
    let output = Command::new("git")
        .arg("-C")
        .arg(path)
        .args(["rev-parse", "--show-toplevel"])
        .output()
        .map_err(|err| {
            ApiErrorPayload::git(
                "GIT_EXEC_FAILED",
                &format!("Failed to execute git: {err}"),
                Some(&guidance_for_git_install()),
            )
        })?;

    if output.status.success() {
        let root = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if root.is_empty() {
            return Ok(None);
        }
        return PathBuf::from(root).canonicalize().map(Some).map_err(|_| {
            ApiErrorPayload::validation(
                "INVALID_REPO_PATH",
                "Failed to resolve repository path",
                None,
            )
        });
    }

    let stderr = String::from_utf8_lossy(&output.stderr).to_lowercase();
    if stderr.contains("not a git repository") {
        return Ok(None);
    }

    let message = String::from_utf8_lossy(&output.stderr).trim().to_string();
    Err(ApiErrorPayload::git(
        "GIT_COMMAND_FAILED",
        if message.is_empty() {
            "Git command failed"
        } else {
            message.as_str()
        },
        Some("Review repository state and retry the operation."),
    ))
}

fn init_repository(path: &Path) -> Result<(), ApiErrorPayload> {
    let output = Command::new("git")
        .arg("-C")
        .arg(path)
        .args(["init", "--quiet"])
        .output()
        .map_err(|err| {
            ApiErrorPayload::git(
                "GIT_EXEC_FAILED",
                &format!("Failed to execute git: {err}"),
                Some(&guidance_for_git_install()),
            )
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(ApiErrorPayload::git(
            "GIT_INIT_FAILED",
            if stderr.is_empty() {
                "Failed to initialize repository"
            } else {
                stderr.as_str()
            },
            Some("Check folder permissions and retry initialization."),
        ));
    }

    Ok(())
}

fn run_git<I, S>(repo_root: &Path, args: I) -> Result<Vec<u8>, ApiErrorPayload>
where
    I: IntoIterator<Item = S>,
    S: AsRef<OsStr>,
{
    let output = Command::new("git")
        .arg("-C")
        .arg(repo_root)
        .args(args)
        .output()
        .map_err(|err| {
            ApiErrorPayload::git(
                "GIT_EXEC_FAILED",
                &format!("Failed to execute git: {err}"),
                Some(&guidance_for_git_install()),
            )
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(ApiErrorPayload::git(
            "GIT_COMMAND_FAILED",
            if stderr.is_empty() {
                "Git command failed".to_string()
            } else {
                stderr
            }
            .as_str(),
            Some("Review repository state and retry the operation."),
        ));
    }

    Ok(output.stdout)
}

fn next_snapshot(entry: &SessionEntry) -> u64 {
    entry.snapshot_id.fetch_add(1, Ordering::SeqCst) + 1
}

fn require_confirmation(confirmed: bool) -> Result<(), ApiErrorPayload> {
    if confirmed {
        return Ok(());
    }
    Err(ApiErrorPayload::policy(
        "CONFIRMATION_REQUIRED",
        "Discard requires explicit confirmation",
        Some("Resubmit with confirmed=true to proceed."),
    ))
}

fn require_init_confirmation(confirmed: bool) -> Result<(), ApiErrorPayload> {
    if confirmed {
        return Ok(());
    }
    Err(ApiErrorPayload::policy(
        "INIT_CONFIRMATION_REQUIRED",
        "Repository initialization requires explicit confirmation",
        Some("Resubmit with confirmed=true to initialize the selected folder."),
    ))
}

fn require_stash_confirmation(confirmed: bool) -> Result<(), ApiErrorPayload> {
    if confirmed {
        return Ok(());
    }
    Err(ApiErrorPayload::policy(
        "STASH_CONFIRMATION_REQUIRED",
        "Destructive stash action requires explicit confirmation",
        Some("Resubmit with confirmed=true to continue."),
    ))
}

fn validate_stash_ref(stash_ref: &str) -> Result<String, ApiErrorPayload> {
    let value = stash_ref.trim();
    if !(value.starts_with("stash@{") && value.ends_with('}')) {
        return Err(ApiErrorPayload::validation(
            "INVALID_STASH_REF",
            "Invalid stash reference",
            Some("Use stash references like stash@{0}."),
        ));
    }
    let index = &value[7..value.len() - 1];
    if index.parse::<u32>().is_err() {
        return Err(ApiErrorPayload::validation(
            "INVALID_STASH_REF",
            "Invalid stash reference",
            Some("Use stash references like stash@{0}."),
        ));
    }
    Ok(value.to_string())
}

fn validate_branch_name(branch: &str) -> Result<String, ApiErrorPayload> {
    let value = branch.trim();
    if value.is_empty() {
        return Err(ApiErrorPayload::validation(
            "EMPTY_BRANCH",
            "Branch name is required",
            None,
        ));
    }
    let output = Command::new("git")
        .args(["check-ref-format", "--branch", value])
        .output()
        .map_err(|err| {
            ApiErrorPayload::git(
                "GIT_EXEC_FAILED",
                &format!("Failed to execute git: {err}"),
                Some(&guidance_for_git_install()),
            )
        })?;
    if !output.status.success() {
        return Err(ApiErrorPayload::validation(
            "INVALID_BRANCH",
            "Invalid branch name",
            Some("Use a valid local branch name (for example: feature/my-change)."),
        ));
    }
    Ok(value.to_string())
}

fn with_remote_failure_guidance(mut err: ApiErrorPayload, operation: &str) -> ApiErrorPayload {
    if err.code == "GIT_COMMAND_FAILED" {
        err.guidance = Some(
            match operation {
                "fetch" => {
                    "Check network/remote access and run Fetch again; verify remote URL and credentials."
                }
                "pull" => {
                    "Resolve local divergence first (commit/stash/rebase), then Pull again."
                }
                "push" => {
                    "Fetch and reconcile remote changes, then Push again; verify upstream and permissions."
                }
                _ => "Review repository state and retry the operation.",
            }
            .to_string(),
        );
    }
    err
}

fn with_stash_failure_guidance(mut err: ApiErrorPayload, operation: &str) -> ApiErrorPayload {
    if err.code == "GIT_COMMAND_FAILED" {
        err.guidance = Some(
            match operation {
                "save" => {
                    "Ensure working changes exist and retry stash save with a descriptive message."
                }
                "apply" => "Resolve conflicts or clean working tree, then retry stash apply.",
                "pop" => "Resolve conflicts or clean working tree before retrying stash pop.",
                "drop" => {
                    "Refresh stash list and verify the stash reference before dropping again."
                }
                "list" => "Verify repository is accessible and retry loading stash entries.",
                _ => "Review repository state and retry the operation.",
            }
            .to_string(),
        );
    }
    err
}

fn parse_stash_list_output(output: &[u8]) -> Vec<StashEntry> {
    String::from_utf8_lossy(output)
        .lines()
        .filter_map(|line| {
            let (stash_ref, subject) = line.split_once('\u{1f}')?;
            Some(StashEntry {
                stash_ref: stash_ref.trim().to_string(),
                subject: subject.trim().to_string(),
            })
        })
        .collect()
}

fn refresh_head(entry: &SessionEntry) -> u64 {
    let snapshot_id = next_snapshot(entry);
    let (head_ref, head_oid) = current_head(&entry.repo_root);
    if let Ok(mut v) = entry.head_ref.lock() {
        *v = head_ref;
    }
    if let Ok(mut v) = entry.head_oid.lock() {
        *v = head_oid;
    }
    snapshot_id
}

fn with_session(state: &AppState, session_id: &str) -> Result<SessionEntry, ApiErrorPayload> {
    let sessions = state
        .sessions
        .lock()
        .map_err(|_| ApiErrorPayload::internal("STATE_POISONED", "Failed to access session map"))?;
    sessions
        .get(session_id)
        .cloned()
        .ok_or_else(|| ApiErrorPayload::not_found("SESSION_NOT_FOUND", "Session not found"))
}

fn decode_path_key(path_key: &str) -> Result<Vec<u8>, ApiErrorPayload> {
    BASE64
        .decode(path_key)
        .map_err(|_| ApiErrorPayload::validation("INVALID_PATH_KEY", "Invalid path key", None))
}

fn validate_repo_relative_path_bytes(relative_path: &[u8]) -> Result<Vec<u8>, ApiErrorPayload> {
    #[cfg(unix)]
    let path = Path::new(OsStr::from_bytes(relative_path));
    #[cfg(not(unix))]
    let path = {
        let as_text = String::from_utf8_lossy(relative_path).to_string();
        Path::new(&as_text)
    };

    if path.is_absolute() {
        return Err(ApiErrorPayload::policy(
            "ABSOLUTE_PATH_DENIED",
            "Absolute paths are not allowed",
            Some("Use repository-relative paths only."),
        ));
    }

    for component in path.components() {
        if matches!(
            component,
            Component::ParentDir | Component::RootDir | Component::Prefix(_)
        ) {
            return Err(ApiErrorPayload::policy(
                "PATH_TRAVERSAL_DENIED",
                "Path escapes repository boundary",
                Some("Use repository-relative paths that stay within the selected repository."),
            ));
        }
    }
    Ok(relative_path.to_vec())
}

fn bytes_to_display(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).to_string()
}

fn bytes_to_os_string(bytes: &[u8]) -> OsString {
    #[cfg(unix)]
    {
        return OsString::from_vec(bytes.to_vec());
    }
    #[cfg(not(unix))]
    {
        OsString::from(String::from_utf8_lossy(bytes).to_string())
    }
}

fn history_pretty_arg() -> String {
    "--pretty=format:%H%x1f%an%x1f%ae%x1f%aI%x1f%s".to_string()
}

fn is_no_commits_yet_error(message: &str) -> bool {
    let lowered = message.to_lowercase();
    lowered.contains("does not have any commits yet")
        || lowered.contains("your current branch")
            && lowered.contains("does not have any commits yet")
}

fn parse_status(
    session_id: &str,
    snapshot_id: u64,
    output: &[u8],
    entry: &SessionEntry,
) -> Result<StatusSnapshot, ApiErrorPayload> {
    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut untracked = Vec::new();
    let mut path_index = HashMap::new();

    for item in output.split(|b| *b == 0) {
        if item.is_empty() {
            continue;
        }
        if item.starts_with(b"? ") {
            let path_bytes = &item[2..];
            let path_key = BASE64.encode(path_bytes);
            path_index.insert(path_key.clone(), path_bytes.to_vec());
            untracked.push(StatusEntry {
                path_display: bytes_to_display(path_bytes),
                path_key,
                staged: false,
                unstaged: false,
                untracked: true,
                status_code: "??".to_string(),
            });
            continue;
        }

        if item.starts_with(b"1 ") || item.starts_with(b"2 ") {
            let (meta_bytes, path_bytes) = match item.iter().position(|b| *b == b'\t') {
                Some(pos) => (&item[..pos], &item[pos + 1..]),
                None => {
                    let mut parts = item.splitn(9, |b| *b == b' ');
                    let mut collected: Vec<&[u8]> = Vec::new();
                    for _ in 0..9 {
                        if let Some(p) = parts.next() {
                            collected.push(p);
                        } else {
                            break;
                        }
                    }
                    if collected.len() < 9 {
                        continue;
                    }
                    let path = collected[8];
                    let meta_len = item.len().saturating_sub(path.len()).saturating_sub(1);
                    (&item[..meta_len], path)
                }
            };
            let meta = String::from_utf8_lossy(meta_bytes);
            let parts: Vec<&str> = meta.split_whitespace().collect();
            if parts.len() < 2 {
                continue;
            }
            let xy = parts[1];
            let mut chars = xy.chars();
            let x = chars.next().unwrap_or('.');
            let y = chars.next().unwrap_or('.');
            let is_staged = x != '.';
            let is_unstaged = y != '.';

            let path_key = BASE64.encode(path_bytes);
            path_index.insert(path_key.clone(), path_bytes.to_vec());
            let entry_item = StatusEntry {
                path_display: bytes_to_display(path_bytes),
                path_key,
                staged: is_staged,
                unstaged: is_unstaged,
                untracked: false,
                status_code: xy.to_string(),
            };

            if is_staged {
                staged.push(entry_item.clone());
            }
            if is_unstaged {
                unstaged.push(entry_item);
            }
        }
    }

    let mut index_guard = entry.path_index.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to update path index for session")
    })?;
    *index_guard = path_index;

    Ok(StatusSnapshot {
        session_id: session_id.to_string(),
        snapshot_id,
        staged,
        unstaged,
        untracked,
    })
}

fn resolve_paths_from_keys(
    entry: &SessionEntry,
    path_keys: &[String],
) -> Result<Vec<OsString>, ApiErrorPayload> {
    if path_keys.is_empty() {
        return Err(ApiErrorPayload::validation(
            "EMPTY_PATHS",
            "At least one path is required",
            None,
        ));
    }

    let index = entry.path_index.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to read path index for session")
    })?;

    let mut paths = Vec::with_capacity(path_keys.len());
    for key in path_keys {
        let decoded_bytes = match index.get(key) {
            Some(path) => path.clone(),
            None => decode_path_key(key)?,
        };
        let safe_bytes = validate_repo_relative_path_bytes(&decoded_bytes)?;
        paths.push(bytes_to_os_string(&safe_bytes));
    }
    Ok(paths)
}

fn current_head(repo_root: &Path) -> (Option<String>, Option<String>) {
    let head_ref = run_git(repo_root, ["symbolic-ref", "--short", "HEAD"])
        .ok()
        .map(|s| String::from_utf8_lossy(&s).trim().to_string())
        .filter(|v| !v.is_empty());
    let head_oid = run_git(repo_root, ["rev-parse", "HEAD"])
        .ok()
        .map(|s| String::from_utf8_lossy(&s).trim().to_string())
        .filter(|v| !v.is_empty());
    (head_ref, head_oid)
}

#[tauri::command]
fn check_git() -> GitAvailability {
    match Command::new("git").arg("--version").output() {
        Ok(output) if output.status.success() => GitAvailability {
            available: true,
            version: Some(String::from_utf8_lossy(&output.stdout).trim().to_string()),
            guidance: None,
        },
        _ => GitAvailability {
            available: false,
            version: None,
            guidance: Some(guidance_for_git_install()),
        },
    }
}

#[tauri::command]
fn open_repo(
    input_path: String,
    state: State<AppState>,
) -> Result<OpenRepoResult, ApiErrorPayload> {
    let canonical_candidate = canonicalize_repo_candidate(&input_path)?;
    let repo_root = detect_repo_root(&canonical_candidate)?;
    match repo_root {
        Some(root) => Ok(OpenRepoResult {
            requires_init: false,
            candidate_path: None,
            session: Some(create_session(&state, root)?),
        }),
        None => Ok(OpenRepoResult {
            requires_init: true,
            candidate_path: Some(canonical_candidate.display().to_string()),
            session: None,
        }),
    }
}

#[tauri::command]
fn init_repo(
    input_path: String,
    confirmed: bool,
    state: State<AppState>,
) -> Result<OpenRepoResult, ApiErrorPayload> {
    require_init_confirmation(confirmed)?;
    let canonical_candidate = canonicalize_repo_candidate(&input_path)?;
    if let Some(root) = detect_repo_root(&canonical_candidate)? {
        return Ok(OpenRepoResult {
            requires_init: false,
            candidate_path: None,
            session: Some(create_session(&state, root)?),
        });
    }

    init_repository(&canonical_candidate)?;
    let root = detect_repo_root(&canonical_candidate)?.ok_or_else(|| {
        ApiErrorPayload::internal(
            "INIT_SESSION_FAILED",
            "Repository initialized but opening session failed",
        )
    })?;

    Ok(OpenRepoResult {
        requires_init: false,
        candidate_path: None,
        session: Some(create_session(&state, root)?),
    })
}

#[tauri::command]
fn get_status(
    session_id: String,
    state: State<AppState>,
) -> Result<StatusSnapshot, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let snapshot_id = next_snapshot(&entry);
    let output = run_git(
        &entry.repo_root,
        [
            "--no-pager",
            "--no-optional-locks",
            "status",
            "--porcelain=v2",
            "-z",
            "--untracked-files=all",
        ],
    )?;
    parse_status(&session_id, snapshot_id, &output, &entry)
}

#[tauri::command]
fn stage_paths(
    session_id: String,
    path_keys: Vec<String>,
    state: State<AppState>,
) -> Result<StatusSnapshot, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    let paths = resolve_paths_from_keys(&entry, &path_keys)?;

    let mut args = vec![OsString::from("add"), OsString::from("--")];
    args.extend(paths);
    run_git(&entry.repo_root, args)?;
    get_status(session_id, state)
}

#[tauri::command]
fn unstage_paths(
    session_id: String,
    path_keys: Vec<String>,
    state: State<AppState>,
) -> Result<StatusSnapshot, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    let paths = resolve_paths_from_keys(&entry, &path_keys)?;

    let mut args = vec![
        OsString::from("restore"),
        OsString::from("--staged"),
        OsString::from("--"),
    ];
    args.extend(paths);
    run_git(&entry.repo_root, args)?;
    get_status(session_id, state)
}

#[tauri::command]
fn discard_paths(
    session_id: String,
    path_keys: Vec<String>,
    confirmed: bool,
    state: State<AppState>,
) -> Result<StatusSnapshot, ApiErrorPayload> {
    require_confirmation(confirmed)?;
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    let paths = resolve_paths_from_keys(&entry, &path_keys)?;

    let mut args = vec![
        OsString::from("restore"),
        OsString::from("--worktree"),
        OsString::from("--source=HEAD"),
        OsString::from("--"),
    ];
    args.extend(paths);
    run_git(&entry.repo_root, args)?;
    get_status(session_id, state)
}

#[tauri::command]
fn get_diff(
    session_id: String,
    path_key: String,
    staged: bool,
    state: State<AppState>,
) -> Result<DiffResult, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let path = resolve_paths_from_keys(&entry, &[path_key])?
        .into_iter()
        .next()
        .ok_or_else(|| ApiErrorPayload::validation("EMPTY_PATHS", "Path is required", None))?;

    let mut args = vec![OsString::from("--no-pager"), OsString::from("diff")];
    if staged {
        args.push(OsString::from("--cached"));
    }
    args.extend([
        OsString::from("--no-color"),
        OsString::from("--no-ext-diff"),
        OsString::from("--"),
        path,
    ]);

    let output = run_git(&entry.repo_root, args)?;
    Ok(DiffResult {
        patch: String::from_utf8_lossy(&output).to_string(),
    })
}

#[tauri::command]
fn create_commit(
    session_id: String,
    message: String,
    state: State<AppState>,
) -> Result<CommitResult, ApiErrorPayload> {
    if message.trim().is_empty() {
        return Err(ApiErrorPayload::validation(
            "EMPTY_COMMIT_MESSAGE",
            "Commit message is required",
            None,
        ));
    }

    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;

    run_git(&entry.repo_root, ["commit", "-m", message.trim()])?;
    let oid = String::from_utf8_lossy(&run_git(&entry.repo_root, ["rev-parse", "HEAD"])?)
        .trim()
        .to_string();
    let summary =
        String::from_utf8_lossy(&run_git(&entry.repo_root, ["log", "-1", "--pretty=%s"])?)
            .trim()
            .to_string();
    let snapshot_id = refresh_head(&entry);

    Ok(CommitResult {
        session_id,
        snapshot_id,
        commit_oid: oid,
        summary,
    })
}

#[tauri::command]
fn fetch_remote(
    session_id: String,
    state: State<AppState>,
) -> Result<SyncActionResult, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    run_git(&entry.repo_root, ["fetch", "--prune"])
        .map_err(|err| with_remote_failure_guidance(err, "fetch"))?;
    let snapshot_id = refresh_head(&entry);
    Ok(SyncActionResult {
        session_id,
        snapshot_id,
        operation: "fetch".to_string(),
        summary: "Fetched remote updates.".to_string(),
    })
}

#[tauri::command]
fn pull_remote(
    session_id: String,
    state: State<AppState>,
) -> Result<SyncActionResult, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    run_git(&entry.repo_root, ["pull", "--ff-only"])
        .map_err(|err| with_remote_failure_guidance(err, "pull"))?;
    let snapshot_id = refresh_head(&entry);
    Ok(SyncActionResult {
        session_id,
        snapshot_id,
        operation: "pull".to_string(),
        summary: "Pulled upstream changes.".to_string(),
    })
}

#[tauri::command]
fn push_remote(
    session_id: String,
    state: State<AppState>,
) -> Result<SyncActionResult, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    run_git(&entry.repo_root, ["push"]).map_err(|err| with_remote_failure_guidance(err, "push"))?;
    let snapshot_id = refresh_head(&entry);
    Ok(SyncActionResult {
        session_id,
        snapshot_id,
        operation: "push".to_string(),
        summary: "Pushed local commits.".to_string(),
    })
}

#[tauri::command]
fn stash_save(
    session_id: String,
    message: String,
    include_untracked: Option<bool>,
    state: State<AppState>,
) -> Result<StashSaveResult, ApiErrorPayload> {
    if message.trim().is_empty() {
        return Err(ApiErrorPayload::validation(
            "EMPTY_STASH_MESSAGE",
            "Stash message is required",
            None,
        ));
    }
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    let mut args = vec![OsString::from("stash"), OsString::from("push")];
    if include_untracked.unwrap_or(false) {
        args.push(OsString::from("--include-untracked"));
    }
    args.push(OsString::from("-m"));
    args.push(OsString::from(message.trim()));
    run_git(&entry.repo_root, args).map_err(|err| with_stash_failure_guidance(err, "save"))?;
    let list_output = run_git(&entry.repo_root, ["stash", "list", "--format=%gd%x1f%s"])?;
    let first = parse_stash_list_output(&list_output).into_iter().next();
    let snapshot_id = refresh_head(&entry);
    Ok(StashSaveResult {
        session_id,
        snapshot_id,
        stash_ref: first.as_ref().map(|v| v.stash_ref.clone()),
        summary: "Saved working changes to stash.".to_string(),
    })
}

#[tauri::command]
fn stash_list(
    session_id: String,
    state: State<AppState>,
) -> Result<Vec<StashEntry>, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let output = run_git(&entry.repo_root, ["stash", "list", "--format=%gd%x1f%s"])
        .map_err(|err| with_stash_failure_guidance(err, "list"))?;
    Ok(parse_stash_list_output(&output))
}

#[tauri::command]
fn stash_apply(
    session_id: String,
    stash_ref: String,
    state: State<AppState>,
) -> Result<SyncActionResult, ApiErrorPayload> {
    let stash_ref = validate_stash_ref(&stash_ref)?;
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    run_git(&entry.repo_root, ["stash", "apply", stash_ref.as_str()])
        .map_err(|err| with_stash_failure_guidance(err, "apply"))?;
    let snapshot_id = refresh_head(&entry);
    Ok(SyncActionResult {
        session_id,
        snapshot_id,
        operation: "stash_apply".to_string(),
        summary: format!("Applied {stash_ref}."),
    })
}

#[tauri::command]
fn stash_pop(
    session_id: String,
    stash_ref: String,
    confirmed: bool,
    state: State<AppState>,
) -> Result<SyncActionResult, ApiErrorPayload> {
    require_stash_confirmation(confirmed)?;
    let stash_ref = validate_stash_ref(&stash_ref)?;
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    run_git(&entry.repo_root, ["stash", "pop", stash_ref.as_str()])
        .map_err(|err| with_stash_failure_guidance(err, "pop"))?;
    let snapshot_id = refresh_head(&entry);
    Ok(SyncActionResult {
        session_id,
        snapshot_id,
        operation: "stash_pop".to_string(),
        summary: format!("Popped {stash_ref}."),
    })
}

#[tauri::command]
fn stash_drop(
    session_id: String,
    stash_ref: String,
    confirmed: bool,
    state: State<AppState>,
) -> Result<SyncActionResult, ApiErrorPayload> {
    require_stash_confirmation(confirmed)?;
    let stash_ref = validate_stash_ref(&stash_ref)?;
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    run_git(&entry.repo_root, ["stash", "drop", stash_ref.as_str()])
        .map_err(|err| with_stash_failure_guidance(err, "drop"))?;
    let snapshot_id = refresh_head(&entry);
    Ok(SyncActionResult {
        session_id,
        snapshot_id,
        operation: "stash_drop".to_string(),
        summary: format!("Dropped {stash_ref}."),
    })
}

#[tauri::command]
fn create_branch(
    session_id: String,
    branch: String,
    checkout: Option<bool>,
    state: State<AppState>,
) -> Result<BranchCreateResult, ApiErrorPayload> {
    let branch = validate_branch_name(&branch)?;
    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;
    if checkout.unwrap_or(true) {
        run_git(&entry.repo_root, ["checkout", "-b", branch.as_str()])?;
    } else {
        run_git(&entry.repo_root, ["branch", branch.as_str()])?;
    }
    let snapshot_id = refresh_head(&entry);
    Ok(BranchCreateResult {
        session_id,
        snapshot_id,
        branch,
        checked_out: checkout.unwrap_or(true),
    })
}

#[tauri::command]
fn list_branches(
    session_id: String,
    state: State<AppState>,
) -> Result<Vec<BranchEntry>, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let output = run_git(
        &entry.repo_root,
        [
            "for-each-ref",
            "refs/heads",
            "--format=%(HEAD)|%(refname:short)|%(upstream:short)",
        ],
    )?;

    let mut branches = Vec::new();
    for line in String::from_utf8_lossy(&output).lines() {
        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() < 3 {
            continue;
        }
        branches.push(BranchEntry {
            is_active: parts[0].trim() == "*",
            name: parts[1].trim().to_string(),
            upstream: if parts[2].trim().is_empty() {
                None
            } else {
                Some(parts[2].trim().to_string())
            },
        });
    }
    Ok(branches)
}

#[tauri::command]
fn list_history(
    session_id: String,
    limit: Option<u32>,
    state: State<AppState>,
) -> Result<Vec<HistoryEntry>, ApiErrorPayload> {
    let entry = with_session(&state, &session_id)?;
    let bounded = limit.unwrap_or(25).clamp(1, 200);
    let pretty_arg = history_pretty_arg();
    let output = match run_git(
        &entry.repo_root,
        [
            "log",
            "-n",
            &bounded.to_string(),
            "--date=iso-strict",
            &pretty_arg,
        ],
    ) {
        Ok(output) => output,
        Err(err) if err.code == "GIT_COMMAND_FAILED" && is_no_commits_yet_error(&err.message) => {
            return Ok(Vec::new())
        }
        Err(err) => return Err(err),
    };

    let mut history = Vec::new();
    for line in String::from_utf8_lossy(&output).lines() {
        let parts: Vec<&str> = line.split('\u{1f}').collect();
        if parts.len() < 5 {
            continue;
        }
        history.push(HistoryEntry {
            oid: parts[0].to_string(),
            author_name: parts[1].to_string(),
            author_email: parts[2].to_string(),
            date_iso: parts[3].to_string(),
            subject: parts[4].to_string(),
        });
    }

    Ok(history)
}

#[tauri::command]
fn checkout_branch(
    session_id: String,
    branch: String,
    state: State<AppState>,
) -> Result<RepoSession, ApiErrorPayload> {
    let branch = validate_branch_name(&branch)?;

    let entry = with_session(&state, &session_id)?;
    let _guard = entry.mutation_lock.lock().map_err(|_| {
        ApiErrorPayload::internal("STATE_POISONED", "Failed to lock mutation queue")
    })?;

    let dirty = run_git(
        &entry.repo_root,
        [
            "--no-pager",
            "status",
            "--porcelain=v2",
            "-z",
            "--untracked-files=all",
        ],
    )?;
    if !dirty.is_empty() {
        return Err(ApiErrorPayload::policy(
            "UNSAFE_CHECKOUT",
            "Cannot checkout with uncommitted changes",
            Some("Commit, stash, or discard your changes before switching branches."),
        ));
    }

    run_git(&entry.repo_root, ["checkout", branch.as_str()])?;
    let (head_ref, head_oid) = current_head(&entry.repo_root);
    if let Ok(mut v) = entry.head_ref.lock() {
        *v = head_ref.clone();
    }
    if let Ok(mut v) = entry.head_oid.lock() {
        *v = head_oid.clone();
    }
    let snapshot_id = next_snapshot(&entry);

    Ok(RepoSession {
        session_id,
        repo_root: entry.repo_root.display().to_string(),
        head_ref,
        head_oid,
        snapshot_id,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            check_git,
            open_repo,
            init_repo,
            fetch_remote,
            pull_remote,
            push_remote,
            stash_save,
            stash_list,
            stash_apply,
            stash_pop,
            stash_drop,
            create_branch,
            get_status,
            stage_paths,
            unstage_paths,
            discard_paths,
            get_diff,
            create_commit,
            list_branches,
            list_history,
            checkout_branch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::{
        canonicalize_repo_candidate, decode_path_key, detect_repo_root, init_repository,
        parse_stash_list_output, parse_status, require_confirmation, require_init_confirmation,
        require_stash_confirmation, validate_branch_name, validate_repo_relative_path_bytes,
        validate_stash_ref, with_remote_failure_guidance, with_stash_failure_guidance, AppState,
        ErrorCategory, SessionEntry,
    };
    use base64::engine::general_purpose::STANDARD as BASE64;
    use base64::Engine;
    use std::collections::HashMap;
    use std::fs;
    use std::path::PathBuf;
    use std::process::Command;
    use std::sync::atomic::AtomicU64;
    use std::sync::{Arc, Mutex};
    use uuid::Uuid;

    fn make_session_entry(repo_root: PathBuf) -> SessionEntry {
        SessionEntry {
            repo_root,
            head_ref: Arc::new(Mutex::new(None)),
            head_oid: Arc::new(Mutex::new(None)),
            snapshot_id: Arc::new(AtomicU64::new(0)),
            path_index: Arc::new(Mutex::new(HashMap::new())),
            mutation_lock: Arc::new(Mutex::new(())),
        }
    }

    fn fixture_repo() -> PathBuf {
        let base = std::env::temp_dir().join(format!("ez-git-test-{}", Uuid::new_v4()));
        fs::create_dir_all(&base).expect("create fixture directory");

        let run = |args: &[&str]| {
            let output = Command::new("git")
                .args(args)
                .current_dir(&base)
                .output()
                .expect("run git");
            assert!(
                output.status.success(),
                "git failed: {:?}",
                String::from_utf8_lossy(&output.stderr)
            );
        };

        run(&["init"]);
        run(&["config", "user.name", "Easy Git Test"]);
        run(&["config", "user.email", "easy-git-test@example.com"]);
        fs::write(base.join("README.md"), "seed\n").expect("write seed file");
        run(&["add", "README.md"]);
        run(&["commit", "-m", "seed"]);
        run(&["checkout", "-b", "feature"]);
        run(&["checkout", "-"]);
        base
    }

    #[test]
    fn rejects_parent_traversal() {
        let result = validate_repo_relative_path_bytes(b"../outside");
        assert!(result.is_err());
    }

    #[test]
    fn accepts_normal_relative_path() {
        let result = validate_repo_relative_path_bytes(b"src/main.rs");
        assert!(result.is_ok());
    }

    #[test]
    fn decodes_base64_path_key() {
        let encoded = BASE64.encode("src/lib.rs");
        let decoded = decode_path_key(&encoded).expect("decode should succeed");
        assert_eq!(decoded, b"src/lib.rs");
    }

    #[test]
    fn reject_absolute_path() {
        let result = validate_repo_relative_path_bytes(b"/tmp/escape");
        assert!(result.is_err());
    }

    #[test]
    fn confirmation_gate_returns_policy_error() {
        let result = require_confirmation(false);
        assert!(result.is_err());
        let payload = result.expect_err("expected policy error");
        assert!(matches!(payload.category, ErrorCategory::Policy));
        assert_eq!(payload.code, "CONFIRMATION_REQUIRED");
    }

    #[test]
    fn init_confirmation_gate_returns_policy_error() {
        let result = require_init_confirmation(false);
        assert!(result.is_err());
        let payload = result.expect_err("expected init policy error");
        assert!(matches!(payload.category, ErrorCategory::Policy));
        assert_eq!(payload.code, "INIT_CONFIRMATION_REQUIRED");
    }

    #[test]
    fn stash_confirmation_gate_returns_policy_error() {
        let result = require_stash_confirmation(false);
        assert!(result.is_err());
        let payload = result.expect_err("expected stash policy error");
        assert!(matches!(payload.category, ErrorCategory::Policy));
        assert_eq!(payload.code, "STASH_CONFIRMATION_REQUIRED");
    }

    #[test]
    fn validates_stash_ref_format() {
        assert!(validate_stash_ref("stash@{0}").is_ok());
        assert!(validate_stash_ref("stash@{abc}").is_err());
        assert!(validate_stash_ref("HEAD").is_err());
    }

    #[test]
    fn validates_branch_name_format() {
        assert!(validate_branch_name("feature/a").is_ok());
        assert!(validate_branch_name("").is_err());
        assert!(validate_branch_name(" bad").is_err());
        let err = validate_branch_name("bad name").expect_err("invalid branch");
        assert!(matches!(err.category, ErrorCategory::Validation));
        assert_eq!(err.code, "INVALID_BRANCH");
    }

    #[test]
    fn remote_failure_guidance_is_operation_specific() {
        let base = super::ApiErrorPayload::git("GIT_COMMAND_FAILED", "pull failed", None);
        let pull = with_remote_failure_guidance(base.clone(), "pull");
        let push = with_remote_failure_guidance(base, "push");
        assert!(
            pull.guidance.unwrap_or_default().contains("divergence"),
            "pull guidance should mention divergence"
        );
        assert!(
            push.guidance.unwrap_or_default().contains("reconcile"),
            "push guidance should mention reconcile"
        );
    }

    #[test]
    fn stash_failure_guidance_is_operation_specific() {
        let base = super::ApiErrorPayload::git("GIT_COMMAND_FAILED", "stash failed", None);
        let apply = with_stash_failure_guidance(base.clone(), "apply");
        let drop = with_stash_failure_guidance(base, "drop");
        assert!(
            apply.guidance.unwrap_or_default().contains("conflicts"),
            "apply guidance should mention conflicts"
        );
        assert!(
            drop.guidance
                .unwrap_or_default()
                .contains("stash reference"),
            "drop guidance should mention stash reference"
        );
    }

    #[test]
    fn parses_stash_list_output_rows() {
        let output = b"stash@{0}\x1fWIP one\nstash@{1}\x1fWIP two\n";
        let parsed = parse_stash_list_output(output);
        assert_eq!(parsed.len(), 2);
        assert_eq!(parsed[0].stash_ref, "stash@{0}");
    }

    #[test]
    fn open_detection_returns_none_for_non_repo_folder() {
        let base = std::env::temp_dir().join(format!("ez-git-non-repo-{}", Uuid::new_v4()));
        fs::create_dir_all(&base).expect("create non repo folder");
        let detected = detect_repo_root(&base).expect("detect should not fail");
        assert!(detected.is_none());
    }

    #[test]
    fn init_repository_creates_repo_and_session_can_be_opened() {
        let base = std::env::temp_dir().join(format!("ez-git-init-flow-{}", Uuid::new_v4()));
        fs::create_dir_all(&base).expect("create init target");
        init_repository(&base).expect("init should succeed");
        let detected = detect_repo_root(&base).expect("detect should succeed");
        assert!(detected.is_some());

        let state = AppState::default();
        let session = super::create_session(&state, detected.expect("repo root expected"))
            .expect("create session");
        assert!(!session.session_id.is_empty());
        assert!(session.repo_root.contains("ez-git-init-flow"));
    }

    #[test]
    fn canonicalize_repo_candidate_rejects_missing_path() {
        let missing = format!("/tmp/definitely-missing-{}", Uuid::new_v4());
        let result = canonicalize_repo_candidate(&missing);
        assert!(result.is_err());
        let payload = result.expect_err("expected missing path error");
        assert_eq!(payload.code, "PATH_NOT_FOUND");
    }

    #[test]
    fn parser_keeps_non_utf8_identity_via_path_key() {
        let mut raw = b"bad-".to_vec();
        raw.push(0x80);
        raw.extend_from_slice(b".txt");

        let mut synthetic_output = b"? ".to_vec();
        synthetic_output.extend(raw.clone());
        synthetic_output.push(0);

        let session = make_session_entry(PathBuf::from("/tmp"));
        let parsed = parse_status("s1", 1, &synthetic_output, &session).expect("parse status");
        assert_eq!(parsed.untracked.len(), 1);
        let key = &parsed.untracked[0].path_key;
        let decoded = decode_path_key(key).expect("decode path key");
        assert_eq!(decoded, raw);
        assert!(parsed.untracked[0].path_display.contains('�'));
    }

    #[test]
    fn e2e_git_flow_stage_unstage_commit_checkout_and_recover_failure() {
        let repo = fixture_repo();
        let session = make_session_entry(repo.clone());
        fs::write(repo.join("README.md"), "seed\nchange\n").expect("modify tracked file");

        let status_1 = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .args([
                "--no-pager",
                "status",
                "--porcelain=v2",
                "-z",
                "--untracked-files=all",
            ])
            .output()
            .expect("status 1");
        let parsed_1 = parse_status("s2", 1, &status_1.stdout, &session).expect("parsed status 1");
        assert!(!parsed_1.unstaged.is_empty());
        let key = parsed_1.unstaged[0].path_key.clone();

        let decoded = decode_path_key(&key).expect("decode");
        let path_arg = super::bytes_to_os_string(&decoded);

        let add = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .arg("add")
            .arg("--")
            .arg(&path_arg)
            .output()
            .expect("git add");
        assert!(add.status.success());

        let unstage = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .args(["restore", "--staged", "--"])
            .arg(&path_arg)
            .output()
            .expect("git unstage");
        assert!(unstage.status.success());

        let add_again = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .arg("add")
            .arg("--")
            .arg(&path_arg)
            .output()
            .expect("git add again");
        assert!(add_again.status.success());

        let commit = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .args(["commit", "-m", "integration flow"])
            .output()
            .expect("git commit");
        assert!(commit.status.success());

        let checkout_clean = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .args(["checkout", "feature"])
            .output()
            .expect("git checkout feature");
        assert!(checkout_clean.status.success());

        fs::write(repo.join("dirty.txt"), "dirty\n").expect("create dirty change");
        let dirty = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .args([
                "--no-pager",
                "status",
                "--porcelain=v2",
                "-z",
                "--untracked-files=all",
            ])
            .output()
            .expect("dirty status");
        assert!(!dirty.stdout.is_empty());

        let bad_cmd = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .arg("definitely-not-a-git-command")
            .output()
            .expect("bad git command");
        assert!(!bad_cmd.status.success());

        let recovery_status = Command::new("git")
            .arg("-C")
            .arg(&repo)
            .args(["status", "--porcelain=v2", "-z", "--untracked-files=all"])
            .output()
            .expect("recovery status");
        assert!(recovery_status.status.success());
    }

    #[test]
    fn repeated_refresh_cycles_are_reliable() {
        let repo = fixture_repo();
        fs::write(repo.join("rapid.txt"), "start\n").expect("write rapid file");
        let session = make_session_entry(repo.clone());
        let start = std::time::Instant::now();

        for i in 0..120 {
            fs::write(repo.join("rapid.txt"), format!("tick-{i}\n")).expect("tick write");
            let status = Command::new("git")
                .arg("-C")
                .arg(&repo)
                .args([
                    "--no-pager",
                    "--no-optional-locks",
                    "status",
                    "--porcelain=v2",
                    "-z",
                    "--untracked-files=all",
                ])
                .output()
                .expect("rapid status");
            assert!(status.status.success());
            let parsed = parse_status("rapid", i as u64, &status.stdout, &session)
                .expect("parse rapid status");
            assert!(!parsed.unstaged.is_empty() || !parsed.untracked.is_empty());
        }

        let elapsed = start.elapsed();
        assert!(
            elapsed.as_secs() < 8,
            "rapid refresh took too long: {elapsed:?}"
        );
    }

    #[test]
    fn history_pretty_arg_uses_format_prefix() {
        let arg = super::history_pretty_arg();
        assert!(arg.starts_with("--pretty=format:"));
        assert!(arg.contains("%H%x1f%an%x1f%ae%x1f%aI%x1f%s"));
    }

    #[test]
    fn detects_no_commits_yet_error_text() {
        let msg = "fatal: your current branch 'master' does not have any commits yet";
        assert!(super::is_no_commits_yet_error(msg));
    }
}
