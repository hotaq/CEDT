# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-24T23:31:00Z
**State:** Greenfield / Design Phase

## OVERVIEW
OpenCode × tmux × Git orchestrator. A system where a CLI controls multiple tmux agents that communicate exclusively via Git state (IPC over Git).

## STRUCTURE
```text
.
└── plan.md    # Greenfield Design Spec (v0)
```

**Planned Layout (.opencode/):**
- `config.json`: System configuration (stdlib compatibility)
- `agents/`: Agent definitions (*.yaml) and worktrees
- `tasks/`: Task assignments (*.json)
- `status/`: Agent status reporting (*.json)
- `log/`: Event logs (ndjson)

## WHERE TO LOOK
| Component | Location | Notes |
|-----------|----------|-------|
| Design Spec| `plan.md`| Source of truth for all protocols |

## CORE PRINCIPLES
- **No daemon**: Stateless execution via CLI
- **Git as IPC**: Agents write status/results to Git; read tasks from Git
- **Deterministic tmux**: Session `opencode`, windows named `opencode:<agent>`
- **Crash-safe**: Resume state via `git pull`

## CONVENTIONS
- **Merge Policy**: Rebase ONLY. No merge commits allowed.
- **Agent Isolation**: Agents never talk directly to each other.
- **Single Pane**: One tmux window = One pane = One agent. No splits.

## ANTI-PATTERNS
- **Direct IPC**: Never use sockets/shared memory between agents.
- **Manual Status Edit**: Humans must not edit `.opencode/status/`.
- **Self-Assignment**: Agents never assign themselves tasks.
- **Merge Commits**: Strictly forbidden; use rebase.

## COMMANDS (V0)
```bash
opencode init
opencode spawn [agents...]
opencode assign [agent] [task_file]
opencode status
```

## NOTES
- Conflict on rebase = Task failure.
- Statuses: `pending`, `running`, `blocked`, `done`, `failed`.
