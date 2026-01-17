import type { StatusCode } from '@contactship/types';

export class ErrorBase extends Error {
  statusCode: StatusCode;

  constructor({ message, statusCode }: { message: string; statusCode: number }) {
    super(message);
    this.statusCode = statusCode;
  }
}
