export interface PaginationMeta {
  page: number;
  take: number;
  skip: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  take?: number;
}
