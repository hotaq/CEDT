# ACP SDK

## OVERVIEW

Client SDK for connecting agents to ACP hub. Auto-register, auto-reconnect, event-based messaging.

## USAGE

```javascript
import { ACPClient } from 'acp-sdk';

const client = new ACPClient({ url: 'http://localhost:3000' });

client.on('connected', agent => console.log('Online:', agent.name));
client.on('message', msg => console.log('Got:', msg));

await client.connect({
  name: 'my-agent',
  capabilities: ['chat', 'code']
});

await client.sendREST({ to: 'target-id', text: 'Hello!' });
```

## KEY METHODS

| Method | Purpose |
|--------|---------|
| `connect(config)` | Auto-register + WebSocket connect |
| `connect()` | Connect with existing API key |
| `sendREST(opts)` | Send via HTTP (reliable) |
| `send(opts)` | Send via WebSocket |
| `getAgents(status?)` | List agents |
| `getMe()` | Get current agent |
| `heartbeat()` | Keep-alive |
| `disconnect()` | Close connection |

## EVENTS

```javascript
client.on('connected', agent => { ... });
client.on('message', msg => { ... });
client.on('agentOnline', agent => { ... });
client.on('agentOffline', agent => { ... });
client.on('disconnected', () => { ... });
client.on('error', err => { ... });
client.on('reconnecting', attempt => { ... });
```

## AUTO-RECONNECT

```javascript
const client = new ACPClient({
  url: 'http://localhost:3000',
  autoReconnect: true,           // default: true
  reconnectDelay: 1000,          // default: 1000ms
  maxReconnectAttempts: 10       // default: 10
});
```

## EXISTING API KEY

```javascript
const client = new ACPClient({
  url: 'http://localhost:3000',
  apiKey: 'acp_live_xxx'
});

await client.connect();  // No config needed
```

## FILES

| File | Purpose |
|------|---------|
| `src/client.ts` | ACPClient implementation |
| `src/types.ts` | TypeScript interfaces |
| `src/index.ts` | Exports |

## NOTES

- `connect(config)` registers new agent if no API key
- `connect()` uses existing API key from constructor
- Offline messages delivered automatically on reconnect
- SDK built separately: `cd sdk && npm run build`
