import { StatusCode } from '@contactship/types';
import { ErrorBase } from './error.base';

export class NotFoundError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({ message, statusCode: StatusCode.NOT_FOUND });
  }
}
