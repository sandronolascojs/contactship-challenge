import { CacheKeyPrefix, CacheKeyTag } from './cache-key.constants';

export class CacheKeyBuilder {
  private parts: string[] = [];

  private prefix: string | null = null;

  private tags: Set<CacheKeyTag> = new Set();

  withPrefix(prefix: CacheKeyPrefix | string): CacheKeyBuilder {
    this.prefix = prefix;

    return this;
  }

  addPart(part: string | number): CacheKeyBuilder {
    this.parts.push(String(part));

    return this;
  }

  addParts(...parts: Array<string | number>): CacheKeyBuilder {
    parts.forEach((part) => this.addPart(part));

    return this;
  }

  withId(id: string | number): CacheKeyBuilder {
    this.parts.push('id');
    this.parts.push(String(id));

    return this;
  }

  withQuery(query: Record<string, unknown>): CacheKeyBuilder {
    const sortedKeys = Object.keys(query).sort();

    const queryParts = sortedKeys.map(
      (key) => `${key}=${JSON.stringify(query[key])}`,
    );

    this.parts.push('query', ...queryParts);

    return this;
  }

  withTag(tag: CacheKeyTag): CacheKeyBuilder {
    this.tags.add(tag);

    return this;
  }

  withTags(...tags: CacheKeyTag[]): CacheKeyBuilder {
    tags.forEach((tag) => this.tags.add(tag));

    return this;
  }

  build(): string {
    const parts = [...this.parts];

    if (this.prefix) {
      parts.unshift(this.prefix);
    }

    return parts.join(':');
  }

  getTags(): CacheKeyTag[] {
    return Array.from(this.tags);
  }

  static create(prefix?: CacheKeyPrefix | string): CacheKeyBuilder {
    const builder = new CacheKeyBuilder();

    if (prefix) {
      builder.withPrefix(prefix);
    }

    return builder;
  }
}
