import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryHealthIndicator {
  isHealthy(key: string, heapUsed: number) {
    const heapUsedMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const isHealthy = heapUsedMB <= heapUsed;

    if (isHealthy) {
      return {
        [key]: {
          status: 'up',
          heapUsed: `${heapUsedMB}MB`,
          heapLimit: `${heapUsed}MB`,
        },
      };
    }

    return {
      [key]: {
        status: 'down',
        message: `Memory usage of ${heapUsedMB}MB exceeds limit of ${heapUsed}MB`,
        heapUsed: `${heapUsedMB}MB`,
        heapLimit: `${heapUsed}MB`,
      },
    };
  }
}
