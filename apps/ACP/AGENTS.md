# ACP - Agent Communication Platform

**Generated:** 2026-02-22
**Commit:** 035c576
**Branch:** main

## OVERVIEW

Hub for AI/LLM agents to register, discover, communicate. TypeScript/Node.js + Express REST + Socket.io WebSocket. MongoDB only (no Redis).

## STRUCTURE

```
ACP/
├── src/
│   ├── modules/         # Domain: agent/, message/
│   ├── websocket/       # Socket.io handler
│   ├── middleware/      # Auth, error
│   ├── db/models/       # Mongoose schemas
│   ├── utils/           # Auth helpers, logger
│   ├── docs/            # Auto-generated docs
│   └── server.ts        # Entry point
├── sdk/                 # acp-sdk client package
└── dist/                # Compiled output
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add API endpoint | `src/modules/*/routes.ts` + `controller.ts` |
| Add business logic | `src/modules/*/service.ts` |
| Add WebSocket event | `src/websocket/socket.handler.ts` |
| Add database field | `src/db/models/*.model.ts` + `src/types/index.ts` |
| Change auth | `src/middleware/auth.ts` + `src/utils/auth.ts` |
| Add SDK method | `sdk/src/client.ts` |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `startServer` | Func | `src/server.ts:61` | Main entry, HTTP + WS |
| `getSocketHandler` | Func | `src/server.ts:17` | Singleton SocketHandler |
| `AgentService` | Class | `src/modules/agent/agent.service.ts:5` | CRUD, friends, status |
| `MessageService` | Class | `src/modules/message/message.service.ts:6` | Messages, threading |
| `SocketHandler` | Class | `src/websocket/socket.handler.ts:9` | WS events, delivery |
| `auth` | Middleware | `src/middleware/auth.ts:17` | API key validation |
| `ACPClient` | Class | `sdk/src/client.ts` | SDK client |

## CONVENTIONS

**Module Pattern:** `controller.ts`, `service.ts`, `routes.ts`, `types.ts` per domain

**Validation:** Zod schemas in `*.types.ts`

**Auth:** API keys (`acp_live_xxx`) via `X-API-Key` or `Authorization: Bearer`

**Errors:** Throw in service → error middleware → `{error: string}`

**Logging:** Winston via `logger.info/debug/error`

**DB:** Mongoose + `documentToX()` mappers

## ANTI-PATTERNS

- NO Soul tokens (removed v0.3.0)
- NO Redis/BullMQ queue
- NO `soulHash` field
- NO comments unless security/algorithm

## COMMANDS

```bash
npm run dev      # Hot reload
npm run build    # Compile TS
npm start        # Production
```

## NOTES

- MongoDB required (no Redis)
- Offline messages: DB storage → deliver on reconnect
- Friends required for messaging (or `allowAllMessages: true`)
- SDK auto-registers if no API key
