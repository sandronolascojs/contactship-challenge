import type { PaginationMeta, PaginationParams } from '../interfaces/response.interface';

export function createPaginationMeta(params: {
  total: number;
  page: number;
  take: number;
}): PaginationMeta {
  const { total, page, take } = params;
  const pages = Math.ceil(total / take);
  const skip = (page - 1) * take;

  return {
    page,
    take,
    skip,
    total,
    pages,
    hasNext: page < pages,
    hasPrevious: page > 1,
  };
}

export function parsePaginationParams(params: PaginationParams): {
  page: number;
  take: number;
  skip: number;
} {
  const page = Math.max(1, params.page || 1);
  const take = Math.min(100, Math.max(1, params.take || 10));
  const skip = (page - 1) * take;

  return { page, take, skip };
}
