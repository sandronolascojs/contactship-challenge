import { LogContext, Logger, LogLevel } from '@contactship/telemetry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppLoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger({
      serviceName: process.env.SERVICE_NAME || 'api',
      level: (process.env.LOG_LEVEL || 'info') as LogLevel,
      redactFields: ['password', 'token', 'secret', 'apiKey'],
      logToFile: process.env.NODE_ENV === 'production',
      logFilePath: 'logs/app.log',
      isProd: process.env.NODE_ENV === 'production',
    });
  }

  setGlobalContext(context: LogContext): void {
    this.logger.setGlobalContext(context);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }
}
