import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/logger.service';
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  SecurityConfigService,
  TransformInterceptor,
} from './config/security';

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
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());

  app.enableCors(securityConfig.getCorsConfig());

  const config = new DocumentBuilder()
    .setTitle('ContactShip API')
    .setDescription(
      'API documentation for ContactShip platform - Lead management and synchronization services',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('leads', 'Lead management operations')
    .addTag('sync', 'Synchronization with external APIs')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'ContactShip API Docs',
  });

  await app.listen(process.env.PORT ?? 3000);

  logger.info(`Server is running on port ${process.env.PORT ?? 3000}`);
  logger.info(
    `Swagger documentation available at http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

void bootstrap();
