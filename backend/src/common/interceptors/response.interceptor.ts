import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the response is a Buffer (like PDF), return it as-is
        if (Buffer.isBuffer(data)) {
          return data as any;
        }

        // If the response already has statusCode and message (already formatted), return it
        if (data && typeof data === 'object' && 'statusCode' in data && 'message' in data) {
          return data;
        }

        // If response is from an external source or has custom structure, check for specific patterns
        if (data && typeof data === 'object') {
          // Handle pagination responses with separate pagination object
          if ('data' in data && 'pagination' in data) {
            return {
              statusCode: response.statusCode || HttpStatus.OK,
              message: data.message || 'Success',
              data: data.data,
              pagination: data.pagination,
              timestamp: new Date().toISOString(),
            };
          }

          // Handle pagination responses with inline structure (data, total, page, limit, totalPages)
          if ('data' in data && 'total' in data && 'page' in data && 'limit' in data && 'totalPages' in data) {
            const { data: items, total, page, limit, totalPages, ...rest } = data;
            return {
              statusCode: response.statusCode || HttpStatus.OK,
              message: rest.message || 'Success',
              data: items,
              pagination: {
                total,
                page,
                limit,
                totalPages,
              },
              timestamp: new Date().toISOString(),
            };
          }

          // Handle responses with access_token (login/auth)
          if ('access_token' in data) {
            const { message, access_token, ...rest } = data;
            return {
              statusCode: response.statusCode || HttpStatus.OK,
              message: message || 'Authentication successful',
              data: {
                access_token,
                ...rest,
              },
              timestamp: new Date().toISOString(),
            };
          }

          // Handle simple success messages
          if ('message' in data && Object.keys(data).length === 1) {
            return {
              statusCode: response.statusCode || HttpStatus.OK,
              message: data.message,
              timestamp: new Date().toISOString(),
            };
          }

          // Handle responses with message and other data
          if ('message' in data) {
            const { message, ...rest } = data;
            return {
              statusCode: response.statusCode || HttpStatus.OK,
              message: message,
              data: Object.keys(rest).length > 0 ? rest : undefined,
              timestamp: new Date().toISOString(),
            };
          }
        }

        // Default formatting
        return {
          statusCode: response.statusCode || HttpStatus.OK,
          message: 'Success',
          data: data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
