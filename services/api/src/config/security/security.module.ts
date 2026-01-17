import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import helmet from 'helmet';
import { HttpExceptionFilter } from './http-exception.filter';
import { LoggingInterceptor } from './logging.interceptor';
import { SecurityConfigService } from './security-config.service';
import { SecurityMiddleware } from './security.middleware';
import { ThrottlerConfigService } from './throttler-config.service';
import { TransformInterceptor } from './transform.interceptor';

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
  exports: [SecurityConfigService, HttpExceptionFilter, TransformInterceptor, LoggingInterceptor],
})
export class SecurityModule implements NestModule {
  constructor(private readonly configService: SecurityConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet(this.configService.getHelmetConfig()), SecurityMiddleware)
      .forRoutes('*path');
  }
}
