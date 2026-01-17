import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { PaginationMeta, Response } from '../../common/interfaces/response.interface';

interface ApiResponse {
  statusCode: number;
}

interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

type ResponseWithMeta<T> = Response<T> & { meta?: PaginationMeta };

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseWithMeta<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseWithMeta<T>> {
    return next.handle().pipe(
      map((data: T | PaginatedData<T>) => {
        const response = context.switchToHttp().getResponse<ApiResponse>();
        const statusCode: number = response.statusCode;

        if (this.isPaginatedResponse(data)) {
          return {
            success: true,
            statusCode,
            data: data.data as T,
            meta: data.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isPaginatedResponse(data: unknown): data is PaginatedData<T> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      'meta' in data &&
      Array.isArray((data as PaginatedData<T>).data)
    );
  }
}
