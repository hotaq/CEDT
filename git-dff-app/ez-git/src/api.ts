import { invoke } from "@tauri-apps/api/core";

export type ErrorCategory = "validation" | "policy" | "git" | "not_found" | "internal";

export interface ApiErrorPayload {
  category: ErrorCategory;
  code: string;
  message: string;
  guidance?: string;
  sessionId?: string;
  snapshotId?: number;
}

export interface GitAvailability {
  available: boolean;
  version?: string;
  guidance?: string;
}

export interface RepoSession {
  sessionId: string;
  repoRoot: string;
  headRef?: string;
  headOid?: string;
  snapshotId: number;
}

export interface OpenRepoResult {
  requiresInit: boolean;
  candidatePath?: string;
  session?: RepoSession;
}

export interface StatusEntry {
  pathDisplay: string;
  pathKey: string;
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
  statusCode: string;
}

export interface StatusSnapshot {
  sessionId: string;
  snapshotId: number;
  staged: StatusEntry[];
  unstaged: StatusEntry[];
  untracked: StatusEntry[];
}

export interface DiffResult {
  patch: string;
}

export interface CommitResult {
  sessionId: string;
  snapshotId: number;
  commitOid: string;
  summary: string;
}

export interface SyncActionResult {
  sessionId: string;
  snapshotId: number;
  operation: string;
  summary: string;
}

export interface StashEntry {
  stashRef: string;
  subject: string;
}

export interface StashSaveResult {
  sessionId: string;
  snapshotId: number;
  stashRef?: string;
  summary: string;
}

export interface BranchCreateResult {
  sessionId: string;
  snapshotId: number;
  branch: string;
  checkedOut: boolean;
}

export interface BranchEntry {
  name: string;
  isActive: boolean;
  upstream?: string;
}

export interface HistoryEntry {
  oid: string;
  authorName: string;
  authorEmail: string;
  dateIso: string;
  subject: string;
}

export async function checkGit() {
  return invoke<GitAvailability>("check_git");
}

export async function openRepo(inputPath: string) {
  return invoke<OpenRepoResult>("open_repo", { inputPath });
}

export async function initRepo(inputPath: string) {
  return invoke<OpenRepoResult>("init_repo", { inputPath, confirmed: true });
}

export async function getStatus(sessionId: string) {
  return invoke<StatusSnapshot>("get_status", { sessionId });
}

export async function stagePaths(sessionId: string, pathKeys: string[]) {
  return invoke<StatusSnapshot>("stage_paths", { sessionId, pathKeys });
}

export async function unstagePaths(sessionId: string, pathKeys: string[]) {
  return invoke<StatusSnapshot>("unstage_paths", { sessionId, pathKeys });
}

export async function discardPaths(sessionId: string, pathKeys: string[]) {
  return invoke<StatusSnapshot>("discard_paths", { sessionId, pathKeys, confirmed: true });
}

export async function getDiff(sessionId: string, pathKey: string, staged: boolean) {
  return invoke<DiffResult>("get_diff", { sessionId, pathKey, staged });
}

export async function createCommit(sessionId: string, message: string) {
  return invoke<CommitResult>("create_commit", { sessionId, message });
}

export async function fetchRemote(sessionId: string) {
  return invoke<SyncActionResult>("fetch_remote", { sessionId });
}

export async function pullRemote(sessionId: string) {
  return invoke<SyncActionResult>("pull_remote", { sessionId });
}

export async function pushRemote(sessionId: string) {
  return invoke<SyncActionResult>("push_remote", { sessionId });
}

export async function stashSave(sessionId: string, message: string, includeUntracked = false) {
  return invoke<StashSaveResult>("stash_save", { sessionId, message, includeUntracked });
}

export async function stashList(sessionId: string) {
  return invoke<StashEntry[]>("stash_list", { sessionId });
}

export async function stashApply(sessionId: string, stashRef: string) {
  return invoke<SyncActionResult>("stash_apply", { sessionId, stashRef });
}

export async function stashPop(sessionId: string, stashRef: string) {
  return invoke<SyncActionResult>("stash_pop", { sessionId, stashRef, confirmed: true });
}

export async function stashDrop(sessionId: string, stashRef: string) {
  return invoke<SyncActionResult>("stash_drop", { sessionId, stashRef, confirmed: true });
}

export async function createBranch(sessionId: string, branch: string, checkout = true) {
  return invoke<BranchCreateResult>("create_branch", { sessionId, branch, checkout });
}

export async function listBranches(sessionId: string) {
  return invoke<BranchEntry[]>("list_branches", { sessionId });
}

export async function listHistory(sessionId: string, limit = 30) {
  return invoke<HistoryEntry[]>("list_history", { sessionId, limit });
}

export async function checkoutBranch(sessionId: string, branch: string) {
  return invoke<RepoSession>("checkout_branch", { sessionId, branch });
}

export function normalizeError(error: unknown): ApiErrorPayload {
  if (typeof error === "object" && error !== null && "category" in error) {
    return error as ApiErrorPayload;
  }
  return {
    category: "internal",
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : String(error)
  };
}
