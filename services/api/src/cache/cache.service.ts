import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

type CacheWithStore = Cache & {
  getStore?: () => {
    keys?: (pattern?: string) => Promise<string[]>;
  };
};

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheWithStore) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return undefined;
    }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      const cached = await this.cacheManager.get<T>(key);

      if (cached !== undefined) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return cached;
      }

      this.logger.debug(`Cache miss for key: ${key}, fetching data...`);
      const value = await factory();

      await this.cacheManager.set(key, value, ttl);

      return value;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error);
      return factory();
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cached key: ${key}, TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Deleted key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const store = this.cacheManager.getStore?.();

      if (store?.keys) {
        const keys = await store.keys(pattern);

        for (const key of keys) {
          await this.cacheManager.del(key);
        }

        this.logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting keys with pattern ${pattern}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.clear();
      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  async invalidateOnCreate(
    keyPattern: string,
    createOperation: () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await this.delPattern(keyPattern);

      this.logger.debug(`Invalidated cache matching pattern: ${keyPattern} before create`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache before create: ${error}`);
    }

    return createOperation();
  }

  async invalidateOnUpdate(
    keyPattern: string,
    updateOperation: () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await this.delPattern(keyPattern);

      this.logger.debug(`Invalidated cache matching pattern: ${keyPattern} before update`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache before update: ${error}`);
    }

    return updateOperation();
  }

  async invalidateOnDelete(
    keyPattern: string,
    deleteOperation: () => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await this.delPattern(keyPattern);

      this.logger.debug(`Invalidated cache matching pattern: ${keyPattern} before delete`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache before delete: ${error}`);
    }

    return deleteOperation();
  }

  getCacheManager(): Cache {
    return this.cacheManager;
  }
}
