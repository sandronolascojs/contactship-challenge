import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SecurityConfigService } from './config/security';
import {
  HttpExceptionFilter,
  TransformInterceptor,
  LoggingInterceptor,
} from './config/security';
import { AppLoggerService } from './common/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const securityConfig = app.get(SecurityConfigService);
  const logger = new AppLoggerService();

  app.setGlobalPrefix(securityConfig.getApiPrefix());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  app.enableCors(securityConfig.getCorsConfig());

  await app.listen(process.env.PORT ?? 3000);

  logger.info(`Server is running on port ${process.env.PORT ?? 3000}`);
}

void bootstrap();
