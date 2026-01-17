import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Request {
  method: string;
  url: string;
  ip: string;
  get: (header: string) => string | undefined;
}

interface Response {
  statusCode: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') ?? '';
    const now = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;
          const delay = Date.now() - now;

          this.logger.log(`Outgoing Response: ${method} ${url} - ${statusCode} - ${delay}ms`);
        },
        error: (error: Error) => {
          const delay = Date.now() - now;
          this.logger.error(`Request Failed: ${method} ${url} - ${error.message} - ${delay}ms`);
        },
      }),
    );
  }
}
