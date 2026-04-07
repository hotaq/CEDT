import { Controller, Get } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

@Controller('api/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('bot')
  getBotOnboarding() {
    return {
      success: true,
      data: this.onboardingService.buildBotOnboardingPayload(),
    };
  }
}
