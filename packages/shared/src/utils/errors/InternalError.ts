import { StatusCode } from '@contactship/types';
import { ErrorBase } from './error.base';

export class InternalError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({
      message,
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
    });
  }
}
