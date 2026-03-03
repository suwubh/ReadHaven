import { z } from 'zod';

interface BoundedIntOptions {
  defaultValue: number;
  min?: number;
  max?: number;
}

interface PaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  maxPageSize?: number;
}

export function parseBoundedInt(
  rawValue: string | null | undefined,
  options: BoundedIntOptions
) {
  const min = options.min ?? 1;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;
  const fallback = clampInt(options.defaultValue, min, max);

  if (typeof rawValue !== 'string') {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return clampInt(parsed, min, max);
}

export function parsePagination(
  searchParams: URLSearchParams,
  options: PaginationOptions = {}
) {
  const page = parseBoundedInt(searchParams.get('page'), {
    defaultValue: options.defaultPage ?? 1,
    min: 1,
  });

  const pageSize = parseBoundedInt(searchParams.get('pageSize'), {
    defaultValue: options.defaultPageSize ?? 20,
    min: 1,
    max: options.maxPageSize ?? 100,
  });

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
) {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return {
      success: true as const,
      data: parsed.data,
    };
  }

  return {
    success: false as const,
    error: parsed.error.issues.map((issue) => issue.message).join('; '),
  };
}

function clampInt(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.floor(value), min), max);
}
