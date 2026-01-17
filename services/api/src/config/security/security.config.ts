import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ThrottlerOptions } from '@nestjs/throttler';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

const RATE_LIMIT_TTL = parseInt(process.env.RATE_LIMIT_TTL ?? '60000', 10);
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10);

type SecurityConfigType = {
  cors: CorsOptions;
  rateLimit: ThrottlerOptions;
};

type HelmetConfigType = {
  contentSecurityPolicy: boolean | undefined;
  crossOriginEmbedderPolicy: boolean;
  hsts: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  referrerPolicy: { policy: string };
};

type ApiConfigType = {
  globalPrefix: string;
  version: string;
};

const _securityConfig = {
  cors: {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  },

  rateLimit: {
    ttl: RATE_LIMIT_TTL,
    limit: RATE_LIMIT_MAX,
  },
};

export const SECURITY_CONFIG = _securityConfig satisfies SecurityConfigType;

const _helmetConfig = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
};

export const HELMET_CONFIG = _helmetConfig satisfies HelmetConfigType;

const _apiConfig = {
  globalPrefix: 'api/v1',
  version: '1.0.0',
};

export const API_CONFIG = _apiConfig satisfies ApiConfigType;
