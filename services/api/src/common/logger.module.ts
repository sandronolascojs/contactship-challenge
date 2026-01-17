import { Module, Provider } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

export const LOGGER_SERVICE = 'LOGGER_SERVICE';

export const LoggerProvider: Provider = {
  provide: LOGGER_SERVICE,
  useClass: AppLoggerService,
};

@Module({
  providers: [LoggerProvider],
  exports: [LOGGER_SERVICE],
})
export class LoggerModule {}
