import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { SECURITY_CONFIG, HELMET_CONFIG, API_CONFIG } from './security.config';

@Injectable()
export class SecurityConfigService {
  getCorsConfig(): CorsOptions {
    return SECURITY_CONFIG.cors;
  }

  getHelmetConfig(): Record<string, unknown> {
    return HELMET_CONFIG;
  }

  getApiPrefix(): string {
    return API_CONFIG.globalPrefix;
  }

  getApiVersion(): string {
    return API_CONFIG.version;
  }
}
