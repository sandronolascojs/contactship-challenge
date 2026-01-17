import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Contactship API',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      documentation: '/api/v1/docs',
      health: '/health',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
