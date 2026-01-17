export interface CacheOptions {
  ttl?: number;

  key?: string;

  keyPrefix?: string;

  invalidateOnCreate?: boolean;

  invalidateOnUpdate?: boolean;

  invalidateOnDelete?: boolean;

  tags?: string[];
}

export interface CacheMetadata {
  key: string;

  ttl: number;

  tags: string[];

  createdAt: Date;

  expiresAt: Date;
}

export interface CacheEntry<T> {
  value: T;

  metadata: CacheMetadata;
}

export interface InvalidateCacheOptions {
  pattern?: string;

  tags?: string[];
}
