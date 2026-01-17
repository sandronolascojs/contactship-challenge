import { StatusCode } from '@contactship/types';
import { ErrorBase } from './error.base';

export class UnauthorizedError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({ message, statusCode: StatusCode.UNAUTHORIZED });
  }
}
