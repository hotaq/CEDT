#!/bin/bash
# Example validation script for PreToolUse hooks
# Blocks specific operations based on command content

# Read JSON input from stdin
INPUT=$(cat)

# Extract the command from tool_input
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command, allow
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Example: Block destructive git operations
if echo "$COMMAND" | grep -iE '\b(git reset --hard|git clean -f|rm -rf /)\b' > /dev/null; then
  echo "Blocked: Destructive operation not allowed" >&2
  exit 2
fi

# Example: Block write operations to specific paths
if echo "$COMMAND" | grep -iE '\b(mv|cp|rm).*\.env|config\.json' > /dev/null; then
  echo "Blocked: Cannot modify sensitive files" >&2
  exit 2
fi

# Allow operation
exit 0
