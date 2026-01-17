import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorMessage =
      typeof message === 'string'
        ? message
        : (message as Record<string, unknown>)?.message || 'Error';

    const errorData = {
      message: errorMessage,
      path: request.url,
      method: request.method,
      ...(status >= 500 && { error: 'Internal Server Error' }),
    };

    const errorResponse = {
      success: false,
      statusCode: status,
      data: errorData,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - Status: ${status}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - Status: ${status} - ${JSON.stringify(errorMessage)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
