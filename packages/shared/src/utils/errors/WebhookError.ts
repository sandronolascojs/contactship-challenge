import { ErrorBase } from './error.base';

export class WebhookError extends ErrorBase {
  constructor(
    message: string,
    public readonly webhookType: string,
    public readonly originalError?: Error,
  ) {
    super({ message, statusCode: 400 });
    this.name = 'WebhookError';
  }
}
