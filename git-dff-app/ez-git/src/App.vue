<script setup lang="ts">
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { filterStatusEntries, groupStatusEntries } from "./status-utils";
import {
  checkGit,
  checkoutBranch,
  createBranch,
  createCommit,
  discardPaths,
  fetchRemote,
  getDiff,
  getStatus,
  initRepo,
  listBranches,
  listHistory,
  normalizeError,
  openRepo,
  pullRemote,
  pushRemote,
  stagePaths,
  stashApply,
  stashDrop,
  stashList,
  stashPop,
  stashSave,
  unstagePaths,
  type BranchEntry,
  type BranchCreateResult,
  type HistoryEntry,
  type RepoSession,
  type StashEntry,
  type StatusEntry,
  type StatusSnapshot
} from "./api";

const gitState = ref<{ available: boolean; version?: string; guidance?: string }>({ available: false });
const repoInput = ref("");
const session = ref<RepoSession | null>(null);
const status = ref<StatusSnapshot | null>(null);
const branches = ref<BranchEntry[]>([]);
const history = ref<HistoryEntry[]>([]);
const stashEntries = ref<StashEntry[]>([]);
const commitMessage = ref("");
const stashMessage = ref("");
const stashIncludeUntracked = ref(false);
const stashTargetRef = ref("");
const newBranchName = ref("");
const newBranchCheckout = ref(true);
const selectedPath = ref<StatusEntry | null>(null);
const selectedPathOrigin = ref<"staged" | "unstaged" | "untracked" | null>(null);
const diffText = ref("");
const loading = ref(false);
const errorText = ref("");
const successText = ref("");
const latestRefreshToken = ref(0);
const refreshTimer = ref<number | null>(null);
const pollTimer = ref<number | null>(null);
const initCandidatePath = ref<string | null>(null);
const LIST_PREVIEW_LIMIT = 30;
const showAllStaged = ref(false);
const showAllUnstaged = ref(false);
const showAllUntracked = ref(false);
const filterQuery = ref("");
const groupMode = ref<"flat" | "directory">("flat");
const densityMode = ref<"comfortable" | "compact">("comfortable");
const focusSection = ref<"staged" | "unstaged" | "untracked">("unstaged");
const focusedPathKey = ref<string | null>(null);
const rangeAnchor = ref<Record<"staged" | "unstaged" | "untracked", string | null>>({
  staged: null,
  unstaged: null,
  untracked: null
});
const selectedBySection = ref<Record<"staged" | "unstaged" | "untracked", Set<string>>>({
  staged: new Set(),
  unstaged: new Set(),
  untracked: new Set()
});

const isDarkMode = ref(false);
const activeTab = ref<"staged" | "unstaged" | "untracked" | "diff">("unstaged");

const formattedDiff = computed(() => {
  if (!diffText.value) return "";
  
  // Escape HTML characters safely
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const lines = diffText.value.split('\n');
  return lines.map(line => {
    const escapedLine = escapeHtml(line);
    if (line.startsWith('+') && !line.startsWith('+++')) {
      return `<span class="diff-add">${escapedLine}</span>`;
    }
    if (line.startsWith('-') && !line.startsWith('---')) {
      return `<span class="diff-del">${escapedLine}</span>`;
    }
    if (line.startsWith('@@ ') || line.startsWith('diff --git') || line.startsWith('index ')) {
      return `<span class="diff-meta">${escapedLine}</span>`;
    }
    return escapedLine;
  }).join('\n');
});

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
}

const activeBranch = computed(() => branches.value.find((b) => b.isActive)?.name ?? "-");
const selectedStash = computed(() => stashEntries.value.find((entry) => entry.stashRef === stashTargetRef.value));
function normalizeQuery() {
  return filterQuery.value.trim().toLowerCase();
}

function filterList(list: StatusEntry[]) {
  return filterStatusEntries(list, normalizeQuery());
}

function visibleList(section: "staged" | "unstaged" | "untracked") {
  const source = status.value?.[section] ?? [];
  const filtered = filterList(source);
  if (section === "staged") {
    return showAllStaged.value ? filtered : filtered.slice(0, LIST_PREVIEW_LIMIT);
  }
  if (section === "unstaged") {
    return showAllUnstaged.value ? filtered : filtered.slice(0, LIST_PREVIEW_LIMIT);
  }
  return showAllUntracked.value ? filtered : filtered.slice(0, LIST_PREVIEW_LIMIT);
}

const stagedVisible = computed(() => visibleList("staged"));
const unstagedVisible = computed(() => visibleList("unstaged"));
const untrackedVisible = computed(() => visibleList("untracked"));

function groupEntries(list: StatusEntry[]) {
  return groupStatusEntries(list, groupMode.value);
}

const stagedGroups = computed(() => groupEntries(stagedVisible.value));
const unstagedGroups = computed(() => groupEntries(unstagedVisible.value));
const untrackedGroups = computed(() => groupEntries(untrackedVisible.value));

function resetSelectionState() {
  selectedBySection.value = {
    staged: new Set(),
    unstaged: new Set(),
    untracked: new Set()
  };
  rangeAnchor.value = { staged: null, unstaged: null, untracked: null };
  focusedPathKey.value = null;
}

function isSelected(section: "staged" | "unstaged" | "untracked", pathKey: string) {
  return selectedBySection.value[section].has(pathKey);
}

function selectedCount(section: "staged" | "unstaged" | "untracked") {
  return selectedBySection.value[section].size;
}

function setSelected(section: "staged" | "unstaged" | "untracked", next: Set<string>) {
  selectedBySection.value = {
    ...selectedBySection.value,
    [section]: next
  };
}

function toggleSelect(section: "staged" | "unstaged" | "untracked", pathKey: string, extend = false) {
  const list = visibleList(section);
  const next = new Set(selectedBySection.value[section]);
  const anchor = rangeAnchor.value[section];
  if (extend && anchor) {
    const start = list.findIndex((entry) => entry.pathKey === anchor);
    const end = list.findIndex((entry) => entry.pathKey === pathKey);
    if (start !== -1 && end !== -1) {
      const from = Math.min(start, end);
      const to = Math.max(start, end);
      for (const entry of list.slice(from, to + 1)) {
        next.add(entry.pathKey);
      }
      setSelected(section, next);
      focusedPathKey.value = pathKey;
      return;
    }
  }
  if (next.has(pathKey)) {
    next.delete(pathKey);
  } else {
    next.add(pathKey);
  }
  rangeAnchor.value[section] = pathKey;
  focusedPathKey.value = pathKey;
  setSelected(section, next);
}

function clearSelection(section?: "staged" | "unstaged" | "untracked") {
  if (!section) {
    resetSelectionState();
    return;
  }
  setSelected(section, new Set());
  rangeAnchor.value[section] = null;
}

function sectionList(section: "staged" | "unstaged" | "untracked") {
  return visibleList(section);
}

function selectAllInSection(section: "staged" | "unstaged" | "untracked") {
  const all = new Set(sectionList(section).map((entry) => entry.pathKey));
  setSelected(section, all);
}

function setFocusedEntry(section: "staged" | "unstaged" | "untracked", pathKey: string) {
  focusSection.value = section;
  focusedPathKey.value = pathKey;
}

function onEntryClick(
  section: "staged" | "unstaged" | "untracked",
  entry: StatusEntry,
  event?: MouseEvent
) {
  setFocusedEntry(section, entry.pathKey);
  if (event?.shiftKey) {
    toggleSelect(section, entry.pathKey, true);
  }
}

function moveFocus(delta: 1 | -1, extend = false) {
  const list = sectionList(focusSection.value);
  if (list.length === 0) {
    return;
  }
  const currentIndex = Math.max(
    0,
    list.findIndex((entry) => entry.pathKey === focusedPathKey.value)
  );
  const nextIndex = Math.min(list.length - 1, Math.max(0, currentIndex + delta));
  const nextEntry = list[nextIndex];
  if (!nextEntry) {
    return;
  }
  focusedPathKey.value = nextEntry.pathKey;
  if (extend) {
    toggleSelect(focusSection.value, nextEntry.pathKey, true);
  }
}

function pruneSelectionAgainstStatus(nextStatus: StatusSnapshot) {
  const next: Record<"staged" | "unstaged" | "untracked", Set<string>> = {
    staged: new Set(),
    unstaged: new Set(),
    untracked: new Set()
  };
  (Object.keys(next) as Array<"staged" | "unstaged" | "untracked">).forEach((section) => {
    const existing = selectedBySection.value[section];
    const available = new Set(nextStatus[section].map((entry) => entry.pathKey));
    for (const key of existing) {
      if (available.has(key)) {
        next[section].add(key);
      }
    }
  });
  selectedBySection.value = next;
  if (
    focusedPathKey.value &&
    !new Set([
      ...nextStatus.staged.map((entry) => entry.pathKey),
      ...nextStatus.unstaged.map((entry) => entry.pathKey),
      ...nextStatus.untracked.map((entry) => entry.pathKey)
    ]).has(focusedPathKey.value)
  ) {
    focusedPathKey.value = null;
  }
}

function canRunBulkAction(section: "staged" | "unstaged" | "untracked", action: "stage" | "unstage" | "discard") {
  if (action === "stage") {
    return section === "unstaged" || section === "untracked";
  }
  if (action === "unstage") {
    return section === "staged";
  }
  return section === "unstaged";
}

async function runBulkAction(
  section: "staged" | "unstaged" | "untracked",
  action: "stage" | "unstage" | "discard"
) {
  if (!session.value) {
    return;
  }
  const selected = [...selectedBySection.value[section]];
  if (selected.length === 0) {
    errorText.value = "Select one or more files first.";
    return;
  }
  if (!canRunBulkAction(section, action)) {
    errorText.value =
      action === "discard"
        ? "Policy: Discard is only available for tracked unstaged files."
        : action === "unstage"
          ? "Policy: Unstage is only available for staged files."
          : "Policy: Stage is only available for unstaged or untracked files.";
    return;
  }
  if (action === "discard") {
    const ok = window.confirm(`Discard ${selected.length} selected file changes?`);
    if (!ok) {
      return;
    }
  }
  clearMessages();
  loading.value = true;
  try {
    if (action === "stage") {
      status.value = await stagePaths(session.value.sessionId, selected);
    } else if (action === "unstage") {
      status.value = await unstagePaths(session.value.sessionId, selected);
    } else {
      status.value = await discardPaths(session.value.sessionId, selected);
    }
    if (status.value) {
      pruneSelectionAgainstStatus(status.value);
    }
    clearSelection(section);
    scheduleRefresh();
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

function resetListViewLimits() {
  showAllStaged.value = false;
  showAllUnstaged.value = false;
  showAllUntracked.value = false;
  resetSelectionState();
}

function setError(error: unknown) {
  const parsed = normalizeError(error);
  errorText.value = `${parsed.code}: ${parsed.message}${parsed.guidance ? ` (${parsed.guidance})` : ""}`;
}

function clearMessages() {
  errorText.value = "";
  successText.value = "";
}

async function refreshAll() {
  if (!session.value) {
    return;
  }
  const token = latestRefreshToken.value + 1;
  latestRefreshToken.value = token;
  const sessionId = session.value.sessionId;
  const [nextStatus, nextBranches, nextHistory, nextStashEntries] = await Promise.all([
    getStatus(sessionId),
    listBranches(sessionId),
    listHistory(sessionId, 30),
    stashList(sessionId)
  ]);
  if (latestRefreshToken.value !== token) {
    return;
  }
  status.value = nextStatus;
  pruneSelectionAgainstStatus(nextStatus);
  branches.value = nextBranches;
  history.value = nextHistory;
  stashEntries.value = nextStashEntries;
  if (stashTargetRef.value && !nextStashEntries.some((entry) => entry.stashRef === stashTargetRef.value)) {
    stashTargetRef.value = "";
  }
}

function scheduleRefresh(delayMs = 150) {
  if (refreshTimer.value !== null) {
    window.clearTimeout(refreshTimer.value);
  }
  refreshTimer.value = window.setTimeout(() => {
    refreshAll().catch(setError);
  }, delayMs);
}

async function initialize() {
  clearMessages();
  gitState.value = await checkGit();
}

async function onOpenRepo() {
  clearMessages();
  if (!repoInput.value.trim()) {
    errorText.value = "Please enter a repository path.";
    return;
  }
  loading.value = true;
  try {
    const result = await openRepo(repoInput.value.trim());
    if (result.requiresInit) {
      session.value = null;
      status.value = null;
      branches.value = [];
      history.value = [];
      stashEntries.value = [];
      diffText.value = "";
      selectedPath.value = null;
      selectedPathOrigin.value = null;
      initCandidatePath.value = result.candidatePath ?? repoInput.value.trim();
      resetListViewLimits();
      successText.value = "Selected folder is not a Git repository. Initialize now?";
      return;
    }
    if (!result.session) {
      throw new Error("Repository open did not return a session");
    }
    initCandidatePath.value = null;
    session.value = result.session;
    resetListViewLimits();
    await refreshAll();
    successText.value = "Repository opened.";
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onChooseRepoFolder() {
  clearMessages();
  try {
    const selected = await openDialog({
      directory: true,
      multiple: false,
      title: "Choose Repository Folder"
    });
    if (!selected) {
      return;
    }
    repoInput.value = selected;
  } catch (error) {
    setError(error);
  }
}

async function onInitializeRepo() {
  if (!initCandidatePath.value) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    const result = await initRepo(initCandidatePath.value);
    if (!result.session) {
      throw new Error("Initialization succeeded but session could not be opened");
    }
    session.value = result.session;
    initCandidatePath.value = null;
    resetListViewLimits();
    await refreshAll();
    successText.value = "Repository initialized and opened.";
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

function onDeclineInit() {
  if (!initCandidatePath.value) {
    return;
  }
  clearMessages();
  successText.value = "Initialization canceled. Choose another repository when ready.";
  initCandidatePath.value = null;
}

async function onStage(entry: StatusEntry) {
  if (!session.value) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    status.value = await stagePaths(session.value.sessionId, [entry.pathKey]);
    if (status.value) {
      pruneSelectionAgainstStatus(status.value);
    }
    scheduleRefresh();
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onUnstage(entry: StatusEntry) {
  if (!session.value) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    status.value = await unstagePaths(session.value.sessionId, [entry.pathKey]);
    if (status.value) {
      pruneSelectionAgainstStatus(status.value);
    }
    scheduleRefresh();
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onDiscard(entry: StatusEntry) {
  if (!session.value) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    status.value = await discardPaths(session.value.sessionId, [entry.pathKey]);
    if (status.value) {
      pruneSelectionAgainstStatus(status.value);
    }
    if (selectedPath.value?.pathKey === entry.pathKey) {
      selectedPath.value = null;
      selectedPathOrigin.value = null;
      diffText.value = "";
    }
    scheduleRefresh();
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onSelectDiff(entry: StatusEntry, origin: "staged" | "unstaged" | "untracked") {
  if (!session.value) {
    return;
  }
  clearMessages();
  setFocusedEntry(origin, entry.pathKey);
  selectedPath.value = entry;
  selectedPathOrigin.value = origin;
  activeTab.value = "diff";
  loading.value = true;
  try {
    const diff = await getDiff(session.value.sessionId, entry.pathKey, origin === "staged");
    diffText.value = diff.patch || "(no diff output)";
  } catch (error) {
    setError(error);
    diffText.value = "";
  } finally {
    loading.value = false;
  }
}

async function onCommit() {
  if (!session.value) {
    return;
  }
  clearMessages();
  if (!commitMessage.value.trim()) {
    errorText.value = "Commit message is required.";
    return;
  }
  loading.value = true;
  try {
    const result = await createCommit(session.value.sessionId, commitMessage.value.trim());
    commitMessage.value = "";
    successText.value = `Committed ${result.commitOid.slice(0, 7)}: ${result.summary}`;
    await refreshAll();
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onSync(operation: "fetch" | "pull" | "push") {
  if (!session.value) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    const result =
      operation === "fetch"
        ? await fetchRemote(session.value.sessionId)
        : operation === "pull"
          ? await pullRemote(session.value.sessionId)
          : await pushRemote(session.value.sessionId);
    await refreshAll();
    successText.value = result.summary;
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onStashSave() {
  if (!session.value) {
    return;
  }
  clearMessages();
  if (!stashMessage.value.trim()) {
    errorText.value = "Stash message is required.";
    return;
  }
  loading.value = true;
  try {
    const result = await stashSave(
      session.value.sessionId,
      stashMessage.value.trim(),
      stashIncludeUntracked.value
    );
    stashMessage.value = "";
    await refreshAll();
    if (result.stashRef) {
      stashTargetRef.value = result.stashRef;
    }
    successText.value = result.summary;
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onStashApply() {
  if (!session.value || !stashTargetRef.value) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    const result = await stashApply(session.value.sessionId, stashTargetRef.value);
    await refreshAll();
    successText.value = result.summary;
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onStashPop() {
  if (!session.value || !stashTargetRef.value) {
    return;
  }
  const ok = window.confirm(`Pop ${stashTargetRef.value}? This removes it if apply succeeds.`);
  if (!ok) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    const result = await stashPop(session.value.sessionId, stashTargetRef.value);
    await refreshAll();
    successText.value = result.summary;
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onStashDrop() {
  if (!session.value || !stashTargetRef.value) {
    return;
  }
  const ok = window.confirm(`Drop ${stashTargetRef.value}? This cannot be undone.`);
  if (!ok) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    const result = await stashDrop(session.value.sessionId, stashTargetRef.value);
    await refreshAll();
    successText.value = result.summary;
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onCreateBranch() {
  if (!session.value) {
    return;
  }
  clearMessages();
  if (!newBranchName.value.trim()) {
    errorText.value = "Branch name is required.";
    return;
  }
  loading.value = true;
  try {
    const result: BranchCreateResult = await createBranch(
      session.value.sessionId,
      newBranchName.value.trim(),
      newBranchCheckout.value
    );
    newBranchName.value = "";
    await refreshAll();
    successText.value = result.checkedOut
      ? `Created and switched to ${result.branch}`
      : `Created branch ${result.branch}`;
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function onCheckout(branch: string) {
  if (!session.value) {
    return;
  }
  clearMessages();
  loading.value = true;
  try {
    session.value = await checkoutBranch(session.value.sessionId, branch);
    await refreshAll();
    successText.value = `Switched to ${branch}`;
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

function keyboardShortcuts(event: KeyboardEvent) {
  if (!session.value || loading.value) {
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "r") {
    event.preventDefault();
    refreshAll().catch(setError);
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveFocus(1, event.shiftKey);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveFocus(-1, event.shiftKey);
    return;
  }
  if (event.key === " ") {
    if (focusedPathKey.value) {
      event.preventDefault();
      toggleSelect(focusSection.value, focusedPathKey.value, event.shiftKey);
    }
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
    event.preventDefault();
    selectAllInSection(focusSection.value);
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    runBulkAction(focusSection.value, "stage").catch(setError);
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "u") {
    event.preventDefault();
    runBulkAction(focusSection.value, "unstage").catch(setError);
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "d") {
    event.preventDefault();
    runBulkAction(focusSection.value, "discard").catch(setError);
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    clearSelection(focusSection.value);
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s" && selectedPath.value) {
    event.preventDefault();
    onStage(selectedPath.value).catch(setError);
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "u" && selectedPath.value) {
    event.preventDefault();
    onUnstage(selectedPath.value).catch(setError);
  }
}

function watcherHintRefresh() {
  if (session.value && !loading.value) {
    scheduleRefresh(0);
  }
}

onMounted(() => {
  initialize().catch(setError);
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark-theme');
  }
  
  window.addEventListener("keydown", keyboardShortcuts);
  window.addEventListener("focus", watcherHintRefresh);
  document.addEventListener("visibilitychange", watcherHintRefresh);
  pollTimer.value = window.setInterval(() => {
    if (session.value && !loading.value) {
      scheduleRefresh(0);
    }
  }, 3000);
});

onUnmounted(() => {
  window.removeEventListener("keydown", keyboardShortcuts);
  window.removeEventListener("focus", watcherHintRefresh);
  document.removeEventListener("visibilitychange", watcherHintRefresh);
  if (refreshTimer.value !== null) {
    window.clearTimeout(refreshTimer.value);
  }
  if (pollTimer.value !== null) {
    window.clearInterval(pollTimer.value);
  }
});
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <div class="hero-top">
        <button class="ghost theme-toggle" @click="toggleDarkMode" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </div>
      <p v-if="!gitState.available && gitState.guidance" class="guidance">{{ gitState.guidance }}</p>
    </header>

    <section class="card repo-open">
      <h2>Open Repository Session</h2>
      <div class="repo-select-bar">
        <div class="input-group">
          <input 
            type="text" 
            readonly 
            :value="repoInput || 'No folder selected'" 
            class="mono-input"
            :class="{ 'empty': !repoInput }"
          />
          <button class="ghost" :disabled="loading" @click="onChooseRepoFolder">Browse...</button>
        </div>
        <button class="primary-action" :disabled="loading || !gitState.available || !repoInput.trim()" @click="onOpenRepo">Open Repository</button>
      </div>
      
      <div v-if="session" class="session-meta">
        <span class="chip">Session: {{ session.sessionId.slice(0, 8) }}</span>
        <span class="chip">HEAD: {{ session.headRef ?? "detached" }}</span>
      </div>

      <div v-if="initCandidatePath" class="init-prompt">
        <p class="mono path-line">Initialization candidate: {{ initCandidatePath }}</p>
        <div class="actions">
          <button :disabled="loading" @click="onInitializeRepo">Initialize</button>
          <button :disabled="loading" class="danger" @click="onDeclineInit">Cancel</button>
        </div>
      </div>
    </section>

    <p v-if="errorText" class="flash error">{{ errorText }}</p>
    <p v-if="successText" class="flash success">{{ successText }}</p>

    <section v-if="session && status" class="layout">
      <div class="layout-column">
      <article class="card">
        <h2>Status + Staging</h2>
        <p class="hint">
          Shortcuts: Ctrl/Cmd+R refresh, Arrow Up/Down focus, Space toggle select, Shift+Arrow range select,
          Ctrl/Cmd+Shift+S/U/D bulk actions, Ctrl/Cmd+A select all in focused section.
        </p>

        <div class="status-tools">
          <input
            v-model="filterQuery"
            class="tool-input"
            placeholder="Filter files by name or path"
            :disabled="loading"
          />
          <select v-model="groupMode" class="tool-select" :disabled="loading">
            <option value="flat">Flat list</option>
            <option value="directory">Group by directory</option>
          </select>
          <select v-model="densityMode" class="tool-select" :disabled="loading">
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
          <button class="ghost" :disabled="loading" @click="clearSelection()">Clear all selections</button>
        </div>

        <div class="tabs">
          <button class="tab-button" :class="{ active: activeTab === 'staged' }" @click="activeTab = 'staged'">
            Staged ({{ status.staged.length }})
          </button>
          <button class="tab-button" :class="{ active: activeTab === 'unstaged' }" @click="activeTab = 'unstaged'">
            Unstaged ({{ status.unstaged.length }})
          </button>
          <button class="tab-button" :class="{ active: activeTab === 'untracked' }" @click="activeTab = 'untracked'">
            Untracked ({{ status.untracked.length }})
          </button>
          <button class="tab-button" :class="{ active: activeTab === 'diff' }" @click="activeTab = 'diff'">
            Diff
          </button>
        </div>

        <div class="status-content" :class="{ compact: densityMode === 'compact' }">
          <div v-show="activeTab === 'staged'">
            <div class="tab-header">
              <h3>Staged Files</h3>
              <p class="list-meta">showing {{ stagedVisible.length }} / {{ status.staged.length }}</p>
            </div>
            <div v-if="status.staged.length > 0" class="bulk-row">
              <span>{{ selectedCount("staged") }} selected</span>
              <div class="actions">
                <button :disabled="selectedCount('staged') === 0 || loading" @click="runBulkAction('staged', 'unstage')">
                  Bulk unstage
                </button>
                <button :disabled="loading" class="ghost" @click="clearSelection('staged')">Clear</button>
              </div>
            </div>
            <p v-else class="empty-note">No staged files.</p>
            <ul class="status-list">
              <template v-for="group in stagedGroups" :key="`staged-${group.label}`">
                <li v-if="groupMode !== 'flat'" class="group-label">{{ group.label }}</li>
                <li
                  v-for="entry in group.items"
                  :key="entry.pathKey"
                  :class="{
                    selected: isSelected('staged', entry.pathKey),
                    focused: focusedPathKey === entry.pathKey && focusSection === 'staged'
                  }"
                  @click="onEntryClick('staged', entry, $event)"
                >
                  <button
                    class="select-dot"
                    :class="{ on: isSelected('staged', entry.pathKey) }"
                    @click.stop="toggleSelect('staged', entry.pathKey, $event.shiftKey)"
                  >
                    {{ isSelected('staged', entry.pathKey) ? '✓' : '○' }}
                  </button>
                  <button class="path" @click="onSelectDiff(entry, 'staged')">{{ entry.pathDisplay }}</button>
                  <button @click="onUnstage(entry)">Unstage</button>
                </li>
              </template>
            </ul>
            <button
              v-if="status.staged.length > LIST_PREVIEW_LIMIT"
              class="ghost"
              @click="showAllStaged = !showAllStaged"
            >
              {{ showAllStaged ? "Show less" : `Show all (${status.staged.length})` }}
            </button>
          </div>

          <div v-show="activeTab === 'unstaged'">
            <div class="tab-header">
              <h3>Unstaged Files</h3>
              <p class="list-meta">showing {{ unstagedVisible.length }} / {{ status.unstaged.length }}</p>
            </div>
            <div v-if="status.unstaged.length > 0" class="bulk-row">
              <span>{{ selectedCount("unstaged") }} selected</span>
              <div class="actions">
                <button
                  :disabled="selectedCount('unstaged') === 0 || loading"
                  @click="runBulkAction('unstaged', 'stage')"
                >
                  Bulk stage
                </button>
                <button
                  :disabled="selectedCount('unstaged') === 0 || loading"
                  class="danger"
                  @click="runBulkAction('unstaged', 'discard')"
                >
                  Bulk discard
                </button>
                <button :disabled="loading" class="ghost" @click="clearSelection('unstaged')">Clear</button>
              </div>
            </div>
            <p v-else class="empty-note">No unstaged files.</p>
            <ul class="status-list">
              <template v-for="group in unstagedGroups" :key="`unstaged-${group.label}`">
                <li v-if="groupMode !== 'flat'" class="group-label">{{ group.label }}</li>
                <li
                  v-for="entry in group.items"
                  :key="entry.pathKey"
                  :class="{
                    selected: isSelected('unstaged', entry.pathKey),
                    focused: focusedPathKey === entry.pathKey && focusSection === 'unstaged'
                  }"
                  @click="onEntryClick('unstaged', entry, $event)"
                >
                  <button
                    class="select-dot"
                    :class="{ on: isSelected('unstaged', entry.pathKey) }"
                    @click.stop="toggleSelect('unstaged', entry.pathKey, $event.shiftKey)"
                  >
                    {{ isSelected('unstaged', entry.pathKey) ? '✓' : '○' }}
                  </button>
                  <button class="path" @click="onSelectDiff(entry, 'unstaged')">{{ entry.pathDisplay }}</button>
                  <div class="actions">
                    <button @click="onStage(entry)">Stage</button>
                    <button class="danger" @click="onDiscard(entry)">Discard</button>
                  </div>
                </li>
              </template>
            </ul>
            <button
              v-if="status.unstaged.length > LIST_PREVIEW_LIMIT"
              class="ghost"
              @click="showAllUnstaged = !showAllUnstaged"
            >
              {{ showAllUnstaged ? "Show less" : `Show all (${status.unstaged.length})` }}
            </button>
          </div>

          <div v-show="activeTab === 'untracked'">
            <div class="tab-header">
              <h3>Untracked Files</h3>
              <p class="list-meta">showing {{ untrackedVisible.length }} / {{ status.untracked.length }}</p>
            </div>
            <div v-if="status.untracked.length > 0" class="bulk-row">
              <span>{{ selectedCount("untracked") }} selected</span>
              <div class="actions">
                <button
                  :disabled="selectedCount('untracked') === 0 || loading"
                  @click="runBulkAction('untracked', 'stage')"
                >
                  Bulk stage
                </button>
                <button :disabled="loading" class="ghost" @click="clearSelection('untracked')">Clear</button>
              </div>
            </div>
            <p v-else class="empty-note">No untracked files.</p>
            <ul class="status-list">
              <template v-for="group in untrackedGroups" :key="`untracked-${group.label}`">
                <li v-if="groupMode !== 'flat'" class="group-label">{{ group.label }}</li>
                <li
                  v-for="entry in group.items"
                  :key="entry.pathKey"
                  :class="{
                    selected: isSelected('untracked', entry.pathKey),
                    focused: focusedPathKey === entry.pathKey && focusSection === 'untracked'
                  }"
                  @click="onEntryClick('untracked', entry, $event)"
                >
                  <button
                    class="select-dot"
                    :class="{ on: isSelected('untracked', entry.pathKey) }"
                    @click.stop="toggleSelect('untracked', entry.pathKey, $event.shiftKey)"
                  >
                    {{ isSelected('untracked', entry.pathKey) ? '✓' : '○' }}
                  </button>
                  <button class="path" @click="onSelectDiff(entry, 'untracked')">{{ entry.pathDisplay }}</button>
                  <button @click="onStage(entry)">Stage</button>
                </li>
              </template>
            </ul>
            <button
              v-if="status.untracked.length > LIST_PREVIEW_LIMIT"
              class="ghost"
              @click="showAllUntracked = !showAllUntracked"
            >
              {{ showAllUntracked ? "Show less" : `Show all (${status.untracked.length})` }}
            </button>
          </div>

          <div v-show="activeTab === 'diff'">
            <div class="tab-header">
              <h3>Diff</h3>
              <p v-if="selectedPath" class="list-meta">{{ selectedPathOrigin }}: {{ selectedPath.pathDisplay }}</p>
            </div>
            <div class="diff-container">
              <pre v-if="diffText" class="diff" v-html="formattedDiff"></pre>
              <pre v-else class="diff">Select a file to view diff.</pre>
            </div>
          </div>
        </div>
      </article>

      <article class="card">
        <h2>Branches</h2>
        <p>active: <strong>{{ activeBranch }}</strong></p>
        <ul class="branch-list">
          <li v-for="branch in branches" :key="branch.name">
            <span>{{ branch.name }}</span>
            <span v-if="branch.isActive" class="chip ok">current</span>
            <button v-else @click="onCheckout(branch.name)">Checkout</button>
          </li>
        </ul>
      </article>
      </div>

      <div class="layout-column">
      <article class="card">
        <h2>Remote Sync</h2>
        <p class="hint">Fetch updates, pull upstream fast-forward changes, or push local commits.</p>
        <div class="actions">
          <button :disabled="loading" @click="onSync('fetch')">Fetch</button>
          <button :disabled="loading" @click="onSync('pull')">Pull (ff-only)</button>
          <button :disabled="loading" @click="onSync('push')">Push</button>
        </div>
      </article>

      <article class="card">
        <h2>Stash Manager</h2>
        <div class="stack">
          <input
            v-model="stashMessage"
            placeholder="Stash message"
            :disabled="loading"
          />
          <label class="inline-check">
            <input v-model="stashIncludeUntracked" type="checkbox" :disabled="loading" />
            include untracked files
          </label>
          <div class="actions">
            <button :disabled="loading || !stashMessage.trim()" @click="onStashSave">Save stash</button>
            <button class="ghost" :disabled="loading" @click="refreshAll().catch(setError)">
              Refresh list
            </button>
          </div>
        </div>

        <div class="stack">
          <select v-model="stashTargetRef" :disabled="loading || stashEntries.length === 0">
            <option value="">Select stash entry</option>
            <option v-for="entry in stashEntries" :key="entry.stashRef" :value="entry.stashRef">
              {{ entry.stashRef }} - {{ entry.subject }}
            </option>
          </select>
          <p v-if="selectedStash" class="list-meta">Selected: {{ selectedStash.subject }}</p>
          <p v-else-if="stashEntries.length === 0" class="empty-note">No stash entries.</p>
          <div class="actions">
            <button :disabled="loading || !stashTargetRef" @click="onStashApply">Apply</button>
            <button :disabled="loading || !stashTargetRef" @click="onStashPop">Pop</button>
            <button class="danger" :disabled="loading || !stashTargetRef" @click="onStashDrop">Drop</button>
          </div>
        </div>
      </article>

      <article class="card">
        <h2>Branch Creator</h2>
        <div class="stack">
          <input
            v-model="newBranchName"
            placeholder="feature/my-branch"
            :disabled="loading"
          />
          <label class="inline-check">
            <input v-model="newBranchCheckout" type="checkbox" :disabled="loading" />
            checkout after create
          </label>
          <button :disabled="loading || !newBranchName.trim()" @click="onCreateBranch">Create branch</button>
        </div>
      </article>

      <article class="card">
        <h2>Commit</h2>
        <textarea
          v-model="commitMessage"
          placeholder="Write a commit message"
          rows="3"
          :disabled="loading"
        />
        <button :disabled="loading || !commitMessage.trim()" @click="onCommit">Create Commit</button>
      </article>

      <article class="card">
        <h2>Recent History</h2>
        <ul class="history-list">
          <li v-for="item in history" :key="item.oid">
            <div class="line-1">
              <code>{{ item.oid.slice(0, 7) }}</code>
              <span>{{ item.subject }}</span>
            </div>
            <div class="line-2">{{ item.authorName }} &lt;{{ item.authorEmail }}&gt; - {{ item.dateIso }}</div>
          </li>
        </ul>
      </article>
      </div>
    </section>
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-family: 'Inter', sans-serif;
  --primary-color: #2563EB;
  --primary-hover: #1D4ED8;
  --bg-color: #F8FAFC;
  --surface-color: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --border-color: #E2E8F0;
  --danger-color: #DC2626;
  --danger-hover: #B91C1C;
  --success-color: #059669;
  --success-bg: #D1FAE5;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --transition: all 0.15s ease;
  
  --diff-add-bg: #D1FAE5;
  --diff-add-text: #065F46;
  --diff-del-bg: #FEE2E2;
  --diff-del-text: #991B1B;
  --diff-meta-text: #1D4ED8;
}

:root.dark-theme {
  --primary-color: #3B82F6;
  --primary-hover: #60A5FA;
  --bg-color: #0F172A;
  --surface-color: #1E293B;
  --text-main: #F8FAFC;
  --text-muted: #94A3B8;
  --border-color: #334155;
  --danger-color: #EF4444;
  --danger-hover: #F87171;
  --success-color: #10B981;
  --success-bg: rgba(16, 185, 129, 0.15);
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  
  --diff-add-bg: rgba(16, 185, 129, 0.15);
  --diff-add-text: #34D399;
  --diff-del-bg: rgba(239, 68, 68, 0.15);
  --diff-del-text: #F87171;
  --diff-meta-text: #60A5FA;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
}

.app-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  gap: 1.25rem;
}

/* Typography elements */
h1, h2, h3 {
  color: var(--text-main);
  font-weight: 700;
  margin-top: 0;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.theme-toggle {
  font-size: 1.25rem;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius-sm);
  line-height: 1;
}

.hero h1 {
  font-size: 2.25rem;
  letter-spacing: -0.02em;
  color: var(--primary-color);
}

.hero p {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.env-row {
  margin-top: 1rem;
}

.guidance {
  color: var(--danger-color);
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

/* Cards */
.card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

/* Layout */
.layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1.4fr 1fr;
  align-items: start;
}

.layout-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.25rem;
  background: var(--bg-color);
  border-radius: var(--radius-sm);
}

.tab-button {
  flex: 1;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
  box-shadow: none;
  padding: 0.6rem;
}

.tab-button:hover:not(:disabled) {
  background: rgba(106, 90, 224, 0.05);
  color: var(--text-main);
  box-shadow: none;
}

.tab-button.active {
  background: var(--surface-color);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
  border-color: transparent;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.tab-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.tab-header .list-meta {
  margin: 0;
}

.status-content.compact li {
  padding: 0.35rem 0.5rem;
}

.status-content.compact .path {
  font-size: 0.85rem;
}

.status-tools {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

/* Inputs & Buttons */
input,
textarea,
select,
button {
  font-family: var(--font-family);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  transition: var(--transition);
  background: var(--surface-color);
  color: var(--text-main);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

input,
textarea {
  width: 100%;
}

button {
  background: var(--primary-color);
  color: #FFFFFF;
  border: none;
  cursor: pointer;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

button:hover:not(:disabled) {
  background: var(--primary-hover);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

.row button {
  min-height: 2.75rem;
}

button.danger {
  background: var(--surface-color);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
  box-shadow: none;
}

button.danger:hover:not(:disabled) {
  background: var(--danger-color);
  color: #FFF;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

button.ghost {
  background: transparent;
  color: var(--text-muted);
  box-shadow: none;
  border: 1px solid transparent;
}

button.ghost:hover:not(:disabled) {
  background: var(--bg-color);
  color: var(--text-main);
}

/* Lists and Items */
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  padding: 0.4rem 0.5rem;
  background: transparent;
  transition: var(--transition);
  flex-wrap: wrap;
}

li:last-child {
  border-bottom: none;
}

li:hover {
  background: rgba(37, 99, 235, 0.05);
}

li.selected {
  background: rgba(37, 99, 235, 0.1);
  border-radius: var(--radius-sm);
}

li.focused {
  outline: 2px solid var(--primary-color);
  outline-offset: 1px;
}

li > button:last-child:not(.path),
li > .actions {
  margin-left: auto;
}

.group-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  text-transform: uppercase;
  padding: 0.25rem 0;
  margin-top: 0.75rem;
  border: none;
  background: transparent;
}

.path {
  text-align: left;
  flex: 1 1 120px;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
  color: var(--text-main);
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  font-size: 0.9rem;
  line-height: 1.35;
}

.path:hover:not(:disabled) {
  background: transparent;
  color: var(--primary-color);
  transform: none;
  box-shadow: none;
}

.repo-open {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.repo-open h2 {
  margin-bottom: 0;
}

.repo-select-bar {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex: 1;
  min-width: 300px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: var(--transition);
}

.input-group:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.mono-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  padding: 0.6rem 1rem;
  color: var(--text-main);
  box-shadow: none !important;
}

.mono-input.empty {
  color: var(--text-muted);
  font-style: italic;
}

.mono-input:focus {
  outline: none;
}

.input-group .ghost {
  border: none;
  border-left: 1px solid var(--border-color);
  border-radius: 0;
  padding: 0 1rem;
  background: var(--surface-color);
}

.primary-action {
  white-space: nowrap;
}

.session-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.init-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.inline-check {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.inline-check input[type="checkbox"] {
  width: auto;
  margin: 0;
  accent-color: var(--primary-color);
}

.actions button {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
}

.row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.bulk-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.bulk-row > span {
  white-space: nowrap;
}

.bulk-row .actions button {
  min-height: 2rem;
  padding: 0.35rem 0.75rem;
  box-shadow: none;
}

.empty-note {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Utilities */
.chip {
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid transparent;
}

.chip.ok {
  background: var(--success-bg);
  color: var(--success-color);
  border-color: rgba(16, 185, 129, 0.2);
}

.chip.danger {
  background: #FEE2E2;
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.2);
}

.mono {
  font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.path-line {
  overflow-wrap: anywhere;
  word-break: break-word;
  color: var(--text-muted);
  font-size: 0.9rem;
  background: var(--bg-color);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  margin-top: 0.5rem;
}

.list-meta {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.status-list {
  max-height: 380px;
  overflow: auto;
  padding-right: 0.5rem;
}

/* Custom Scrollbar for status list */
.status-list::-webkit-scrollbar {
  width: 6px;
}
.status-list::-webkit-scrollbar-track {
  background: transparent;
}
.status-list::-webkit-scrollbar-thumb {
  background-color: #CBD5E1;
  border-radius: 20px;
}

.select-dot {
  min-width: 2rem;
  height: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-muted);
  box-shadow: none;
  border-radius: 50%;
}

.select-dot.on {
  background: var(--primary-color);
  color: #FFF;
}

.flash {
  margin: 0;
  padding: 1rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.flash.error {
  background: #FEE2E2;
  color: var(--danger-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.flash.success {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.hint {
  margin-top: -0.25rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.diff {
  min-height: 320px;
  margin: 0;
  border-radius: var(--radius-sm);
  background: var(--surface-color);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 1rem;
  overflow: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre;
  max-width: 100%;
}

.diff-container {
  max-width: 100%;
  overflow-x: hidden;
}

.diff-add {
  background-color: var(--diff-add-bg);
  color: var(--diff-add-text);
  display: inline-block;
  min-width: 100%;
}

.diff-del {
  background-color: var(--diff-del-bg);
  color: var(--diff-del-text);
  display: inline-block;
  min-width: 100%;
}

.diff-meta {
  color: var(--diff-meta-text);
  font-weight: 600;
  display: inline-block;
  min-width: 100%;
  margin-top: 0.5rem;
  opacity: 0.9;
}

.branch-list,
.history-list {
  max-height: 300px;
  overflow: auto;
}

.line-1 {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.line-1 code {
  background: var(--bg-color);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--primary-color);
}

.line-1 span {
  font-weight: 500;
}

.line-2 {
  font-size: 0.85rem;
  color: var(--text-muted);
  overflow-wrap: anywhere;
  margin-top: 0.25rem;
}

@media (max-width: 1024px) {
  .app-shell {
    padding: 1.5rem;
  }
  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero h1 {
    font-size: 1.75rem;
  }
  .card {
    padding: 1rem;
  }
  .row {
    flex-direction: column;
    align-items: stretch;
  }
  .row button,
  .actions button {
    width: 100%;
  }
  .bulk-row .actions button {
    width: auto;
  }
  .status-tools {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  li {
    align-items: flex-start;
    flex-direction: column;
  }
  .actions {
    width: 100%;
  }
}
</style>
