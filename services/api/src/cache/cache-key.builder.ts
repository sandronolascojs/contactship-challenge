import { CacheKeyPrefix } from './cache.constants';

export class CacheKeyBuilder {
  private parts: string[] = [];

  private prefix: string | null = null;

  withPrefix(prefix: CacheKeyPrefix | string): this {
    this.prefix = prefix;

    return this;
  }

  addPart(part: string | number): this {
    this.parts.push(String(part));

    return this;
  }

  addParts(...parts: (string | number)[]): this {
    parts.forEach((part) => this.addPart(part));

    return this;
  }

  withId(id: string | number): this {
    this.parts.push('id');
    this.parts.push(String(id));

    return this;
  }

  withQuery(query: Record<string, unknown>): this {
    const sortedKeys = Object.keys(query).sort();

    const queryParts = sortedKeys.map((key) => `${key}=${JSON.stringify(query[key])}`);

    this.parts.push('query', ...queryParts);

    return this;
  }

  build(): string {
    const parts = [...this.parts];

    if (this.prefix) {
      parts.unshift(this.prefix);
    }

    return parts.join(':');
  }

  static create(prefix?: CacheKeyPrefix | string): CacheKeyBuilder {
    const builder = new CacheKeyBuilder();

    if (prefix) {
      builder.withPrefix(prefix);
    }

    return builder;
  }
}
