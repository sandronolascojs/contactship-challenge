import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import helmet from 'helmet';
import { SecurityConfigService } from './security-config.service';
import { ThrottlerConfigService } from './throttler-config.service';
import { SecurityMiddleware } from './security.middleware';
import { HttpExceptionFilter } from './http-exception.filter';
import { TransformInterceptor } from './transform.interceptor';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfigService,
    }),
  ],
  providers: [
    SecurityConfigService,
    SecurityMiddleware,
    ThrottlerConfigService,
    HttpExceptionFilter,
    TransformInterceptor,
    LoggingInterceptor,
  ],
  exports: [
    SecurityConfigService,
    HttpExceptionFilter,
    TransformInterceptor,
    LoggingInterceptor,
  ],
})
export class SecurityModule implements NestModule {
  constructor(private readonly configService: SecurityConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet(this.configService.getHelmetConfig()), SecurityMiddleware)
      .forRoutes('*path');
  }
}
