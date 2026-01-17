import { Injectable } from '@nestjs/common';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { SECURITY_CONFIG } from './security.config';

@Injectable()
export class ThrottlerConfigService {
  createThrottlerOptions(): ThrottlerModuleOptions {
    return [SECURITY_CONFIG.rateLimit];
  }
}
