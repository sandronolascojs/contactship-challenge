import { CacheKeyBuilder } from './cache-key.builder';
import { CacheKeyPrefix } from './cache.constants';

export function buildLeadKey(id: string): string {
  return CacheKeyBuilder.create(CacheKeyPrefix.LEADS).withId(id).build();
}

export function buildLeadsListKey(options: Record<string, unknown>): string {
  return CacheKeyBuilder.create(CacheKeyPrefix.LEADS).addPart('list').withQuery(options).build();
}

export function buildPersonKey(id: string): string {
  return CacheKeyBuilder.create(CacheKeyPrefix.PERSONS).withId(id).build();
}

export function buildPersonsListKey(options: Record<string, unknown>): string {
  return CacheKeyBuilder.create(CacheKeyPrefix.PERSONS).addPart('list').withQuery(options).build();
}

export function buildStatisticsKey(type: string, period?: string): string {
  return CacheKeyBuilder.create(CacheKeyPrefix.STATISTICS)
    .addPart(type)
    .addPart(period || 'all')
    .build();
}

export function buildSearchKey(entity: string, query: Record<string, unknown>): string {
  return CacheKeyBuilder.create(CacheKeyPrefix.SEARCH).addPart(entity).withQuery(query).build();
}

export function buildPattern(prefix: CacheKeyPrefix | string): string {
  return `${prefix}:*`;
}
