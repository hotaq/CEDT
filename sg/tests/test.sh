#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$ROOT_DIR/bin/git-account"
TEST_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/git-account-tests.XXXXXX")"

PASS_COUNT=0
FAIL_COUNT=0

cleanup() {
  rm -rf "$TEST_ROOT"
}

trap cleanup EXIT

assert_eq() {
  local expected="$1"
  local actual="$2"
  local context="$3"

  [[ "$actual" == "$expected" ]] || {
    printf 'Assertion failed: %s\n' "$context" >&2
    printf '  expected: %s\n' "$expected" >&2
    printf '  actual:   %s\n' "$actual" >&2
    return 1
  }
}

assert_contains() {
  local needle="$1"
  local haystack="$2"
  local context="$3"

  [[ "$haystack" == *"$needle"* ]] || {
    printf 'Assertion failed: %s\n' "$context" >&2
    printf '  missing: %s\n' "$needle" >&2
    printf '  output:  %s\n' "$haystack" >&2
    return 1
  }
}

run_capture() {
  local output_var="$1"
  local status_var="$2"
  shift 2

  local command_output
  local command_status

  set +e
  command_output="$("$@" 2>&1)"
  command_status=$?
  set -e

  printf -v "$output_var" '%s' "$command_output"
  printf -v "$status_var" '%s' "$command_status"
}

make_repo() {
  local repo_dir="$1"

  mkdir -p "$repo_dir"
  git -C "$repo_dir" init -q
}

test_help_output() {
  local output
  local status

  run_capture output status "$CLI" help

  assert_eq "0" "$status" "help exits successfully" &&
    assert_contains "Usage:" "$output" "help shows usage"
}

test_add_list_use_and_current() {
  local sandbox="$TEST_ROOT/roundtrip"
  local config_root="$sandbox/config"
  local repo_dir="$sandbox/repo"
  local output
  local status

  make_repo "$repo_dir"

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" add work dev@company.com "Dev User"
  assert_eq "0" "$status" "add succeeds" || return 1
  assert_contains 'Saved preset "work"' "$output" "add confirms save" || return 1

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" list
  assert_eq "0" "$status" "list succeeds" || return 1
  assert_contains "work" "$output" "list shows preset name" || return 1
  assert_contains "dev@company.com" "$output" "list shows preset email" || return 1

  run_capture output status bash -c 'cd "$1" && GIT_ACCOUNT_CONFIG_ROOT="$2" "$3" use work' bash "$repo_dir" "$config_root" "$CLI"
  assert_eq "0" "$status" "use succeeds inside a Git repo" || return 1
  assert_contains 'Applied preset "work"' "$output" "use confirms preset" || return 1
  assert_eq "Dev User" "$(git -C "$repo_dir" config --local --get user.name)" "use writes local user.name" || return 1
  assert_eq "dev@company.com" "$(git -C "$repo_dir" config --local --get user.email)" "use writes local user.email" || return 1

  run_capture output status bash -c 'cd "$1" && GIT_ACCOUNT_CONFIG_ROOT="$2" "$3" current' bash "$repo_dir" "$config_root" "$CLI"
  assert_eq "0" "$status" "current succeeds inside a Git repo" || return 1
  assert_contains "user.name=Dev User" "$output" "current reads local user.name" || return 1
  assert_contains "user.email=dev@company.com" "$output" "current reads local user.email" || return 1
}

test_add_replaces_existing_preset() {
  local sandbox="$TEST_ROOT/replace"
  local config_root="$sandbox/config"
  local output
  local status

  mkdir -p "$sandbox"

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" add work old@company.com "Old User"
  assert_eq "0" "$status" "first add succeeds" || return 1

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" add work new@company.com "New User"
  assert_eq "0" "$status" "second add succeeds" || return 1

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" list
  assert_eq "0" "$status" "list succeeds after replacement" || return 1
  assert_contains "new@company.com" "$output" "replacement keeps the latest email" || return 1
  assert_contains "New User" "$output" "replacement keeps the latest name" || return 1
  [[ "$output" != *"old@company.com"* ]] || {
    printf 'Assertion failed: replaced preset should not keep previous email\n' >&2
    return 1
  }
}

test_remove_preset() {
  local sandbox="$TEST_ROOT/remove"
  local config_root="$sandbox/config"
  local output
  local status

  mkdir -p "$sandbox"

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" add personal me@example.com "My Name"
  assert_eq "0" "$status" "add succeeds before remove" || return 1

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" remove personal
  assert_eq "0" "$status" "remove succeeds" || return 1
  assert_contains 'Removed preset "personal"' "$output" "remove confirms deletion" || return 1

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" list
  assert_eq "0" "$status" "list succeeds after remove" || return 1
  assert_eq "No presets saved." "$output" "list is empty after remove"
}

test_use_requires_git_repo() {
  local sandbox="$TEST_ROOT/not-a-repo"
  local config_root="$sandbox/config"
  local output
  local status

  mkdir -p "$sandbox"

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" add work dev@company.com "Dev User"
  assert_eq "0" "$status" "add succeeds outside a repo" || return 1

  run_capture output status bash -c 'cd "$1" && GIT_ACCOUNT_CONFIG_ROOT="$2" "$3" use work' bash "$sandbox" "$config_root" "$CLI"
  assert_eq "1" "$status" "use fails outside a Git repo" || return 1
  assert_contains "Error: not inside a Git repository" "$output" "use reports missing repo"
}

test_argument_validation() {
  local sandbox="$TEST_ROOT/validation"
  local config_root="$sandbox/config"
  local output
  local status

  mkdir -p "$sandbox"

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" add "" dev@company.com "Dev User"
  assert_eq "1" "$status" "add rejects empty preset" || return 1
  assert_contains "Error: preset cannot be empty" "$output" "add reports empty preset" || return 1

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" list extra
  assert_eq "1" "$status" "list rejects extra args" || return 1
  assert_contains "Error: list takes no arguments" "$output" "list reports extra args" || return 1

  run_capture output status env GIT_ACCOUNT_CONFIG_ROOT="$config_root" "$CLI" current extra
  assert_eq "1" "$status" "current rejects extra args" || return 1
  assert_contains "Error: current takes no arguments" "$output" "current reports extra args"
}

run_test() {
  local name="$1"

  if "$name"; then
    printf 'ok - %s\n' "$name"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    printf 'not ok - %s\n' "$name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

run_test test_help_output
run_test test_add_list_use_and_current
run_test test_add_replaces_existing_preset
run_test test_remove_preset
run_test test_use_requires_git_repo
run_test test_argument_validation

printf '\n%d passed, %d failed\n' "$PASS_COUNT" "$FAIL_COUNT"

[[ "$FAIL_COUNT" -eq 0 ]]
