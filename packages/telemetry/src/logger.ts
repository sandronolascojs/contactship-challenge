import winston, { Logger as WinstonLogger, format, transports } from 'winston';

/**
 * Log levels supported by the logger.
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Contextual information for each log entry.
 */
export type LogContext = {
  userId?: string;
  path?: string;
  statusCode?: number;
  error?: string | Error;
  requestId?: string;
  ip?: string;
  [key: string]: unknown;
};

/**
 * Options for initializing the Logger.
 */
export type LoggerInitOptions = {
  serviceName: string;
  level?: LogLevel;
  redactFields?: string[];
  logToFile?: boolean;
  logFilePath?: string;
  globalContext?: LogContext;
  isProd?: boolean;
};

export class Logger {
  private readonly logger: WinstonLogger;
  private readonly serviceName: string;
  private globalContext: LogContext = {};

  constructor({
    serviceName,
    level = 'info',
    redactFields = [],
    logToFile = false,
    logFilePath = 'logs/app.log',
    globalContext = {},
    isProd,
  }: LoggerInitOptions) {
    this.serviceName = serviceName;
    this.globalContext = globalContext;

    // Winston formats
    const redactFormat = format((info) => {
      if (redactFields.length > 0) {
        for (const field of redactFields) {
          if (info[field]) info[field] = '[REDACTED]';
        }
      }
      return info;
    });

    const baseFormat = format((info) => {
      info.serviceName = this.serviceName;
      info.timestamp = new Date().toISOString();
      return info;
    });

    const consoleDevFormat = format.combine(
      redactFormat(),
      baseFormat(),
      format.colorize(),
      format.printf((info) => {
        const {
          timestamp,
          serviceName: svc,
          level,
          message,
          ...meta
        } = info as Record<string, unknown>;
        const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${String(timestamp)}] [${String(svc)}] ${String(level)}: ${String(message)}${metaString}`;
      }),
    );

    const loggerTransports = [];
    if (logToFile) {
      loggerTransports.push(
        new transports.File({
          filename: logFilePath,
          level,
          format: format.combine(redactFormat(), baseFormat(), format.json()),
        }),
      );
    }
    if (!isProd) {
      loggerTransports.push(
        new transports.Console({
          level,
          format: consoleDevFormat,
        }),
      );
    } else if (!logToFile) {
      loggerTransports.push(
        new transports.Console({
          level,
          format: format.combine(redactFormat(), baseFormat(), format.json()),
        }),
      );
    }

    this.logger = winston.createLogger({
      level,
      // Default format (mainly used for transports without an explicit format)
      format: format.combine(redactFormat(), baseFormat(), format.json()),
      transports: loggerTransports,
    });
  }

  /**
   * Set or update global context (e.g., requestId, userId) for all logs.
   */
  setGlobalContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Log an info message with optional context.
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.formatContext(context));
  }

  /**
   * Log a warning message with optional context.
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.formatContext(context));
  }

  /**
   * Log an error message with optional context.
   */
  error(message: string, context?: LogContext): void {
    this.logger.error(message, this.formatContext(context));
  }

  /**
   * Log a debug message with optional context.
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.formatContext(context));
  }

  /**
   * Formats context for logging and keeps logs flat (no nested `context` field).
   */
  private formatContext(context?: LogContext): Record<string, unknown> {
    const merged: Record<string, unknown> = {
      ...this.globalContext,
      ...context,
    };
    if (merged.error instanceof Error) {
      merged.error = merged.error.stack ?? merged.error.message;
    }
    return merged;
  }
}

/**
 * Example usage:
 *
 * // Singleton logger for a service
 * export const logger = new Logger({
 *   serviceName: 'my-service',
 *   level: process.env.LOG_LEVEL as LogLevel || 'info',
 *   redactFields: ['userId', 'password', 'token'],
 *   logToFile: process.env.APP_ENV === 'production',
 *   logFilePath: 'logs/my-service.log',
 *   isProd: process.env.APP_ENV === 'production',
 * });
 *
 * // Set global context (e.g., per request)
 * logger.setGlobalContext({ requestId: 'abc-123', userId: 'user-1' });
 *
 * // Log with additional context
 * logger.info('User login', { path: '/login', statusCode: 200 });
 * logger.error('Failed to fetch data', { error: new Error('DB error'), path: '/data', statusCode: 500 });
 */
