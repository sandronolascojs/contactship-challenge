import { Injectable, Logger } from '@nestjs/common';
import type { RandomUserApiResponse } from './dto';

@Injectable()
export class RandomuserApiService {
  private readonly logger = new Logger(RandomuserApiService.name);
  private readonly baseUrl = 'https://randomuser.me/api/';

  async fetchRandomUsers(
    count: number,
  ): Promise<RandomUserApiResponse['results']> {
    this.logger.log(`Fetching ${count} random users from RandomUser.me`);

    try {
      const response = await fetch(`${this.baseUrl}?results=${count}&nat=us`);

      if (!response.ok) {
        throw new Error(`RandomUser.me API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as RandomUserApiResponse;
      const users = data.results || [];

      this.logger.log(`Successfully fetched ${users.length} users`);

      return users;
    } catch (error) {
      this.logger.error('Failed to fetch random users', error);
      throw error;
    }
  }
}
