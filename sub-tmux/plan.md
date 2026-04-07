Say less 😄
Let’s do a **true greenfield spec** — clean, opinionated, minimal, and extensible.

Below is a **from-zero design** you can actually build without rewriting later.

---

# OpenCode × tmux × Git

## Greenfield Design Spec (v0)

> Goal:
> One CLI controls multiple tmux “agents”.
> Agents communicate **only via Git state**, not direct IPC.
> tmux is execution, Git is memory, CLI is brain.

---

## 0️⃣ Core principles (lock these in)

1. **No daemon**
2. **No tmux plugins**
3. **No shared memory**
4. **Git is the single source of truth**
5. **Agents are replaceable**
6. **Crash-safe by default**

If something breaks, `git pull` fixes it.

---

## 1️⃣ Mental model

```
You (OpenCode)
   |
   v
CLI (orchestrator)
   |
   +--> tmux session (agent A)
   +--> tmux session (agent B)
   +--> tmux session (agent C)
           |
           v
         Git repo
```

Agents **never talk to each other directly**.
They only:

* read tasks from Git
* write results to Git

---

## 2️⃣ Repo layout (non-negotiable)

```text
repo/
├─ .opencode/
│  ├─ config.yaml
│  ├─ agents/
│  │  ├─ frontend.yaml
│  │  ├─ backend.yaml
│  │  └─ tests.yaml
│  ├─ tasks/
│  │  ├─ frontend.json
│  │  ├─ backend.json
│  │  └─ tests.json
│  ├─ status/
│  │  ├─ frontend.json
│  │  ├─ backend.json
│  │  └─ tests.json
│  └─ log/
│     └─ events.ndjson
```

**Rules**

* `.opencode/` is owned by the system
* humans don’t edit `status/`
* agents don’t edit other agents’ files

---

## 3️⃣ Agent definition

`.opencode/agents/frontend.yaml`

```yaml
name: frontend
branch: agent/frontend
workdir: .
shell: bash
entrypoint: opencode-agent
```

This allows:

* multiple agents on same repo
* custom shells later
* remote execution later

---

## 4️⃣ Task protocol (simple + strict)

`.opencode/tasks/frontend.json`

```json
{
  "id": "login-ui-001",
  "status": "pending",
  "instructions": "Implement login page with email + password",
  "constraints": [
    "use existing auth API",
    "no new dependencies"
  ]
}
```

Allowed `status`:

* `pending`
* `running`
* `blocked`
* `done`
* `failed`

---

## 5️⃣ Status protocol (agent → coordinator)

`.opencode/status/frontend.json`

```json
{
  "task_id": "login-ui-001",
  "state": "running",
  "progress": "Building form component",
  "last_update": "2026-01-24T12:41:00Z"
}
```

Coordinator **never writes this**.

---

## 6️⃣ Event log (append-only, gold)

`.opencode/log/events.ndjson`

```json
{"ts":"...","agent":"frontend","event":"task_started","task":"login-ui-001"}
{"ts":"...","agent":"frontend","event":"commit","hash":"abc123"}
{"ts":"...","agent":"backend","event":"blocked","reason":"missing schema"}
```

This is how you:

* debug weird behavior
* replay state
* build UI later

---

## 7️⃣ tmux layout (deterministic)

Single tmux **session**: `opencode`

Windows:

```text
opencode:coord
opencode:frontend
opencode:backend
opencode:tests
```

Each window:

* exactly 1 pane
* pane == agent

No splits. Keep it boring.

---

## 8️⃣ Agent bootstrap (THIS IS KEY)

Each tmux agent runs:

```bash
#!/usr/bin/env bash
set -e

git checkout agent/frontend

while true; do
  git pull --rebase
  opencode-agent step
  sleep 2
done
```

If tmux dies → restart → state resumes.

---

## 9️⃣ `opencode-agent step` behavior

Pseudocode:

```text
if no task or task.status != pending:
    exit

write status = running
commit status

execute task instructions

if success:
    write status = done
else:
    write status = failed

commit + push
```

**Important**
Agent NEVER:

* assigns itself tasks
* edits task files
* merges branches

---

## 🔟 CLI commands (v0 surface)

```bash
opencode init
opencode spawn frontend backend tests
opencode assign frontend tasks/frontend.json
opencode status
opencode logs frontend
opencode merge frontend
opencode kill backend
```

Everything else is future sugar.

---

## 1️⃣1️⃣ Merge policy (coordinator-only)

```text
agent/frontend → main
agent/backend  → main
```

Rules:

* rebase, don’t merge
* conflict = task failure
* coordinator decides retry

---

## 1️⃣2️⃣ Why this scales

Later you can add:

* remote agents (SSH)
* non-tmux runners (containers)
* UI dashboard
* LLM-driven agents
* policy engines
* CRDT-ish merging

**Without changing the protocol.**

---

## Next move (pick ONE)

I can:
1️⃣ Write **actual Go CLI skeleton**
2️⃣ Write **opencode-agent implementation**
3️⃣ Write **tmux orchestration code**
4️⃣ Write **task/state schema validation**
5️⃣ Design **LLM-backed agent behavior**

Tell me the number and we build it piece by piece like adults 🧠🔥
