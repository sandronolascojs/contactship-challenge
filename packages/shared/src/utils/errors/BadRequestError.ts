import { StatusCode } from '@contactship/types';
import { ErrorBase } from './error.base';

export class BadRequestError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({ message, statusCode: StatusCode.BAD_REQUEST });
  }
}
