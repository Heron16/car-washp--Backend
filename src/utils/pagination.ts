import { PaginatedResult } from '../types';

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export function getPaginationParams(page?: number, limit?: number) {
  const currentPage = Math.max(1, page || 1);
  const pageLimit = Math.min(50, Math.max(1, limit || 10));
  const skip = (currentPage - 1) * pageLimit;
  return { currentPage, pageLimit, skip };
}
