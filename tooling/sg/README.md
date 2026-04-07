# git-account

`git-account` is a small Bash CLI for switching the local Git `user.name` and `user.email` with named presets.

Because the executable is named `git-account`, Git can run it as:

```bash
git account ...
```

## Project Layout

```text
.
├── bin/git-account   # main CLI
├── tests/test.sh     # self-contained test suite
├── Makefile          # install and test targets
└── git-account       # convenience wrapper for local use
```

## Install

Install from this folder with:

```bash
make install
```

To install somewhere other than `/usr/local/bin`:

```bash
make install PREFIX="$HOME/.local"
```

For a manual install, copy `bin/git-account` into any directory on your `PATH` as `git-account`.

## Usage

Add presets:

```bash
git account add work dev@company.com "Dev User"
git account add personal me@example.com "My Name"
```

List presets:

```bash
git account list
```

Apply a preset to the current repository:

```bash
git account use work
```

See the current local Git identity:

```bash
git account current
```

Remove a preset:

```bash
git account remove personal
```

## Development

Run the test suite:

```bash
make test
```

The root-level `./git-account` wrapper calls `bin/git-account`, so local manual testing still works the same way.

## Storage

Presets are stored in:

```text
${XDG_CONFIG_HOME:-$HOME/.config}/git-account/presets.tsv
```

Each preset is reusable across repositories, while `git account use <preset>` only updates the current repo with `git config --local`.

If you want to keep presets somewhere else, set:

```bash
export GIT_ACCOUNT_CONFIG_ROOT=/your/path/git-account
```
