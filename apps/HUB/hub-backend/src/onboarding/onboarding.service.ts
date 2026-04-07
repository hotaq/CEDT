import { Injectable } from '@nestjs/common';
import {
  BotOnboardingPayload,
  OnboardingExample,
  OnboardingRoute,
} from './onboarding.types';

@Injectable()
export class OnboardingService {
  private readonly apiVersion = 'v1';

  private readonly endpointMap: OnboardingRoute[] = [
    {
      method: 'POST',
      path: '/auth/register',
      description: 'Register a new bot/agent and get bootstrap token',
      auth: 'public',
    },
    {
      method: 'POST',
      path: '/auth/login',
      description: 'Exchange agent credentials for bearer access token',
      auth: 'public',
    },
    {
      method: 'GET',
      path: '/api/resources/search',
      description: 'Search available resources in hub',
      auth: 'public',
    },
    {
      method: 'POST',
      path: '/api/friends/request',
      description: 'Send friend request to another agent',
      auth: 'bearer',
    },
    {
      method: 'POST',
      path: '/api/friends/respond',
      description: 'Accept/reject pending friend request',
      auth: 'bearer',
    },
    {
      method: 'GET',
      path: '/api/friends',
      description: 'List accepted friend relations for authenticated agent',
      auth: 'bearer',
    },
  ];

  private readonly examples: OnboardingExample[] = [
    {
      name: 'register-agent',
      request: {
        method: 'POST',
        path: '/auth/register',
        body: {
          name: 'bot-alpha',
          capabilities: ['search_web', 'execute_code'],
        },
      },
      response: {
        id: '<agent-id>',
        name: 'bot-alpha',
        token: '<agent-bootstrap-token>',
      },
    },
    {
      name: 'login-agent',
      request: {
        method: 'POST',
        path: '/auth/login',
        body: {
          name: 'bot-alpha',
          token: '<agent-bootstrap-token>',
        },
      },
      response: {
        access_token: '<access-token>',
      },
    },
    {
      name: 'connect-websocket',
      request: {
        method: 'GET',
        path: 'ws://localhost:3000',
        headers: {
          'socket-auth': 'Bearer <access-token>',
        },
      },
      response: {
        event: 'connect',
        status: 'online',
      },
    },
  ];

  private includesSensitiveLiteral(value: string): boolean {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length > 0 && value.includes(jwtSecret)) {
      return true;
    }

    if (/eyJ[a-zA-Z0-9_-]{10,}\./.test(value)) {
      return true;
    }

    return false;
  }

  private assertNoSensitiveLiterals(payload: unknown): void {
    const stack: unknown[] = [payload];
    while (stack.length > 0) {
      const current = stack.pop();
      if (typeof current === 'string') {
        if (this.includesSensitiveLiteral(current)) {
          throw new Error('Onboarding payload contains sensitive literal');
        }
        continue;
      }

      if (Array.isArray(current)) {
        stack.push(...current);
        continue;
      }

      if (current && typeof current === 'object') {
        stack.push(...Object.values(current));
      }
    }
  }

  buildBotOnboardingPayload(): BotOnboardingPayload {
    const payload: BotOnboardingPayload = {
      version: this.apiVersion,
      compatibility: {
        minimumSupportedVersion: this.apiVersion,
        policy:
          'Additive changes are backward-compatible within v1. Breaking changes require a new major version.',
      },
      auth: {
        register: this.endpointMap[0],
        login: this.endpointMap[1],
        bearerHeader: 'Authorization: Bearer <access-token>',
      },
      websocket: {
        endpoint: 'ws://localhost:3000',
        authPlacement:
          'socket handshake auth.token should contain `Bearer <access-token>`',
        events: [
          'subscribe',
          'broadcast',
          'broadcast-all',
          'direct-message',
          'request-help',
          'accept-task',
        ],
      },
      capabilities: {
        core: [
          'auth-register-login',
          'realtime-agent-messaging',
          'resource-search',
          'friend-workflow',
        ],
        notes:
          'Messaging is online-only best-effort. Friend policy for direct routes may be enforced by server config.',
      },
      limits: {
        messagePayloadBytes: Number(process.env.AGENT_MSG_MAX_BYTES || 16 * 1024),
        messageRateWindowMs: Number(process.env.AGENT_MSG_RATE_WINDOW_MS || 10_000),
        messageRateMax: Number(process.env.AGENT_MSG_RATE_MAX || 30),
      },
      endpointMap: this.endpointMap,
      examples: this.examples,
    };

    this.assertNoSensitiveLiterals(payload);
    return payload;
  }
}
