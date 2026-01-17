import { CacheKeyBuilder } from './cache-key.builder';
import { CacheKeyPrefix } from './cache-key.constants';

export class CacheKeyUtils {
  static buildLeadKey(id: string): string {
    return CacheKeyBuilder.create(CacheKeyPrefix.LEADS).withId(id).build();
  }

  static buildLeadsListKey(options: Record<string, unknown>): string {
    return CacheKeyBuilder.create(CacheKeyPrefix.LEADS)
      .addPart('list')
      .withQuery(options)
      .build();
  }

  static buildPersonKey(id: string): string {
    return CacheKeyBuilder.create(CacheKeyPrefix.PERSONS).withId(id).build();
  }

  static buildPersonsListKey(options: Record<string, unknown>): string {
    return CacheKeyBuilder.create(CacheKeyPrefix.PERSONS)
      .addPart('list')
      .withQuery(options)
      .build();
  }

  static buildStatisticsKey(type: string, period?: string): string {
    return CacheKeyBuilder.create(CacheKeyPrefix.STATISTICS)
      .addPart(type)
      .addPart(period || 'all')
      .build();
  }

  static buildSearchKey(
    entity: string,
    query: Record<string, unknown>,
  ): string {
    return CacheKeyBuilder.create(CacheKeyPrefix.SEARCH)
      .addPart(entity)
      .withQuery(query)
      .build();
  }

  static buildPattern(prefix: CacheKeyPrefix | string): string {
    return `${prefix}:*`;
  }
}
