# Response Structure

## Standard Response

All API responses follow a consistent structure:

```typescript
{
  success: boolean;
  statusCode: number;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}
```

## Paginated Response

When data is paginated, the response includes a `meta` object with pagination details:

```typescript
{
  success: true;
  statusCode: 200;
  data: T[];
  meta: {
    page: number;        // Current page (1-indexed)
    take: number;        // Items per page (1-100)
    skip: number;        // Number of items skipped
    total: number;       // Total number of items
    pages: number;       // Total number of pages
    hasNext: boolean;    // Whether there is a next page
    hasPrevious: boolean; // Whether there is a previous page
  };
  timestamp: string;
}
```

## Error Response

Error responses follow the same structure but with `success: false`:

```typescript
{
  success: false;
  statusCode: number;
  data: {
    message: string;
    path: string;
    method: string;
    error?: string;
  };
  timestamp: string;
}
```

## Usage Example

### Controller

```typescript
@Get()
async findAll(
  @Query('page') page?: string,
  @Query('take') take?: string,
) {
  const pageNumber = page ? parseInt(page, 10) : 1;
  const takeNumber = take ? parseInt(take, 10) : 10;
  const skip = (pageNumber - 1) * takeNumber;

  return this.leadsService.findMany({ skip, take: takeNumber });
}
```

### Service

```typescript
async findMany(options: FindLeadsOptions = {}): Promise<PaginatedResponse<SelectLead>> {
  const result = await this.leadsRepository.findMany(options);

  const page = options.skip ? options.skip / (options.take || 10) + 1 : 1;
  const take = options.take || 10;

  const meta = createPaginationMeta({
    total: result.total,
    page,
    take,
  });

  return {
    data: result.leads,
    meta,
  };
}
```

### Pagination Parameters

- `page`: Current page number (default: 1, minimum: 1)
- `take`: Items per page (default: 10, minimum: 1, maximum: 100)

### Example Request

```
GET /leads?page=2&take=20
```

### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    { "id": "1", "email": "john@example.com" },
    { "id": "2", "email": "jane@example.com" }
  ],
  "meta": {
    "page": 2,
    "take": 20,
    "skip": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrevious": true
  },
  "timestamp": "2026-01-17T02:00:00.000Z"
}
```
