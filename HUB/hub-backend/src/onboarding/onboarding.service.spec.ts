import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  it('builds onboarding payload with required sections', () => {
    const service = new OnboardingService();
    const payload = service.buildBotOnboardingPayload();

    expect(payload.version).toBe('v1');
    expect(payload.auth.register.path).toBe('/auth/register');
    expect(payload.auth.login.path).toBe('/auth/login');
    expect(payload.websocket.events).toContain('broadcast-all');
    expect(payload.capabilities.core).toContain('realtime-agent-messaging');
    expect(Array.isArray(payload.endpointMap)).toBe(true);
    expect(payload.endpointMap.length).toBeGreaterThan(0);
    expect(Array.isArray(payload.examples)).toBe(true);
    expect(payload.examples.length).toBeGreaterThan(0);
  });

  it('does not include literal secrets in payload values', () => {
    const previous = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'SUPER_SECRET_FOR_TESTING';

    try {
      const service = new OnboardingService();
      const payload = service.buildBotOnboardingPayload();
      const serialized = JSON.stringify(payload);
      expect(serialized).not.toContain('SUPER_SECRET_FOR_TESTING');
    } finally {
      if (previous === undefined) {
        delete process.env.JWT_SECRET;
      } else {
        process.env.JWT_SECRET = previous;
      }
    }
  });
});
