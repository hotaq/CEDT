---
name: git-helpers
description: Git utility commands for common operations. Use when working with git commands, commits, or repository operations.
disable-model-invocation: false
---

# Git Helpers

Available commands:

## Commit

Create a conventional commit:

```bash
git add -A
git commit -m "$(cat <<'EOF'
   $ARGUMENTS

   Co-Authored-By: Claude Code <noreply@anthropic.com>
   EOF
   )"
```

## Status

Current repository status:

!`git status --short`

Branch: !`git branch --show-current`

Recent commits: !`git log --oneline -5`

## Diff Summary

Changes since last commit:

!`git diff --stat`
