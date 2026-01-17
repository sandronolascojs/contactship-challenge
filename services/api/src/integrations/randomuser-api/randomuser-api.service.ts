import { Injectable, Logger } from '@nestjs/common';
import type { RandomUserApiResponse } from './dto';

@Injectable()
export class RandomuserApiService {
  private readonly logger = new Logger(RandomuserApiService.name);
  private readonly baseUrl = 'https://randomuser.me/api/';
  private readonly defaultTimeout = 30000; // 30 seconds

  async fetchRandomUsers(
    count: number,
    timeoutMs = this.defaultTimeout,
  ): Promise<RandomUserApiResponse['results']> {
    this.logger.log(`Fetching ${count} random users from RandomUser.me`);

    const fetchStart = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}?results=${count}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const fetchDuration = Date.now() - fetchStart;
      this.logger.debug(`API call completed in ${fetchDuration}ms`);

      if (!response.ok) {
        throw new Error(`RandomUser.me API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as RandomUserApiResponse;
      const users = data.results;

      this.logger.log(`Successfully fetched ${users.length} users`);

      return users;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(`Request timeout after ${timeoutMs}ms while fetching random users`);
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }

      this.logger.error('Failed to fetch random users', error);
      throw error;
    }
  }
}
