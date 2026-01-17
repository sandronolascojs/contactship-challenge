export interface ICacheStrategy {
  get<T>(key: string): Promise<T | null>;

  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  del(key: string): Promise<void>;

  delPattern(pattern: string): Promise<void>;

  exists(key: string): Promise<boolean>;

  clear(): Promise<void>;

  ping(): Promise<boolean>;

  disconnect(): Promise<void>;
}
