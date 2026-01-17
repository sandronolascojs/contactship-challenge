# Security Configuration

Enterprise-level security configuration for the NestJS API.

## Features

- **CORS**: Configurable cross-origin resource sharing with whitelist support
- **Helmet**: Security HTTP headers middleware
- **Rate Limiting**: Request throttling to prevent abuse
- **Input Sanitization**: Automatic sanitization of request body and query parameters
- **Global Exception Filter**: Centralized error handling with consistent response format
- **Response Transformation**: Standardized API response format
- **Request Logging**: Comprehensive logging of all incoming/outgoing requests

## Configuration

Environment variables (`.env`):

```env
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_TTL=60000  # Time window in milliseconds (1 minute)
RATE_LIMIT_MAX=100    # Max requests per time window
```

## Middleware Pipeline

1. **Helmet**: Security headers
2. **Security Middleware**: Input sanitization and additional security headers
3. **Rate Limiting**: Request throttling
4. **CORS**: Cross-origin resource sharing

## Security Headers Applied

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- HSTS (in production)
- Content Security Policy (in production)

## Input Sanitization

All incoming request bodies and query parameters are automatically sanitized to:

- Remove HTML tags (`<>`)
- Trim whitespace
- Limit string length (max 1000 chars)
- Recursively sanitize nested objects and arrays

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2024-01-16T03:00:00.000Z"
}
```

Error responses:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-16T03:00:00.000Z",
  "path": "/api/v1/leads",
  "method": "POST",
  "message": "Validation failed"
}
```

## Usage

The security module is automatically loaded in `AppModule`. All security features are applied globally.

### Manual Application

If you need to apply security features manually:

```typescript
import { SecurityConfigService } from './config/security';

// Get configuration
const securityConfig = app.get(SecurityConfigService);

// Apply CORS
app.enableCors(securityConfig.getCorsConfig());
```

## Files Structure

```
src/config/security/
├── index.ts                          # Barrel exports
├── security.config.ts                # Configuration constants
├── security.module.ts                # Security module definition
├── security-config.service.ts        # Configuration service
├── security.middleware.ts            # Security middleware
├── throttler-config.service.ts       # Rate limiting config
├── http-exception.filter.ts          # Global exception filter
├── transform.interceptor.ts          # Response transformation
└── logging.interceptor.ts            # Request logging
```
