export type OnboardingRoute = {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  description: string;
  auth: 'public' | 'bearer';
};

export type OnboardingExample = {
  name: string;
  request: {
    method: 'GET' | 'POST' | 'DELETE';
    path: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
  };
  response: Record<string, unknown>;
};

export type BotOnboardingPayload = {
  version: string;
  compatibility: {
    minimumSupportedVersion: string;
    policy: string;
  };
  auth: {
    register: OnboardingRoute;
    login: OnboardingRoute;
    bearerHeader: string;
  };
  websocket: {
    endpoint: string;
    authPlacement: string;
    events: string[];
  };
  capabilities: {
    core: string[];
    notes: string;
  };
  limits: {
    messagePayloadBytes: number;
    messageRateWindowMs: number;
    messageRateMax: number;
  };
  endpointMap: OnboardingRoute[];
  examples: OnboardingExample[];
};
