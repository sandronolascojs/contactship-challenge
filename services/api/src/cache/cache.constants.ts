export enum CacheKeyPrefix {
  LEADS = 'leads',

  PERSONS = 'persons',

  USERS = 'users',

  SESSIONS = 'sessions',

  PERMISSIONS = 'permissions',

  SETTINGS = 'settings',

  STATISTICS = 'statistics',

  SEARCH = 'search',

  API = 'api',

  SYSTEM = 'system',
}

export enum CacheKeyTag {
  LEADS = 'leads',

  PERSONS = 'persons',

  SEARCH = 'search',

  LISTINGS = 'listings',

  SINGLE = 'single',
}

export const DEFAULT_CACHE_TTL = 300;

export const DEFAULT_CACHE_TTL_SHORT = 60;

export const DEFAULT_CACHE_TTL_LONG = 600;

export const DEFAULT_CACHE_TTL_EXTRA_LONG = 1800;
