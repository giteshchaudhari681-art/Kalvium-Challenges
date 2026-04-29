import { PrismaClient } from '@prisma/client';
import { HttpError } from '../utils/httpError.js';

const prisma = new PrismaClient();
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const SORTABLE_FIELDS = ['id', 'name', 'price', 'category', 'stock', 'createdAt', 'updatedAt'];
const SELECTABLE_FIELDS = [
  'id',
  'name',
  'description',
  'price',
  'category',
  'stock',
  'imageUrl',
  'isActive',
  'createdAt',
  'updatedAt',
];

function parsePositiveInteger(value, fieldName, defaultValue) {
  if (value === undefined) return defaultValue;

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new HttpError(400, `${fieldName} must be a positive integer`);
  }

  return parsedValue;
}

function buildSelect(fields) {
  if (fields === undefined) return undefined;

  const requestedFields = fields
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  if (requestedFields.length === 0) {
    throw new HttpError(400, 'fields must contain at least one valid field name');
  }

  const invalidFields = requestedFields.filter((field) => !SELECTABLE_FIELDS.includes(field));
  if (invalidFields.length > 0) {
    throw new HttpError(400, `Invalid fields requested: ${invalidFields.join(', ')}`);
  }

  return requestedFields.reduce((select, field) => {
    select[field] = true;
    return select;
  }, {});
}

function parseSort(sortBy, order) {
  const resolvedSortBy = sortBy ?? 'createdAt';
  const resolvedOrder = order ?? 'desc';

  if (!SORTABLE_FIELDS.includes(resolvedSortBy)) {
    throw new HttpError(400, `sortBy must be one of: ${SORTABLE_FIELDS.join(', ')}`);
  }

  if (!['asc', 'desc'].includes(resolvedOrder)) {
    throw new HttpError(400, 'order must be either asc or desc');
  }

  return {
    sortBy: resolvedSortBy,
    order: resolvedOrder,
  };
}

export async function getProducts(query = {}) {
  const page = parsePositiveInteger(query.page, 'page', DEFAULT_PAGE);
  const requestedLimit = parsePositiveInteger(query.limit, 'limit', DEFAULT_LIMIT);
  if (requestedLimit > MAX_LIMIT) {
    throw new HttpError(400, `limit cannot exceed ${MAX_LIMIT}`);
  }
  const limit = requestedLimit;
  const { sortBy, order } = parseSort(query.sortBy, query.order);
  const select = buildSelect(query.fields);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      select,
    }),
    prisma.product.count(),
  ]);

  return {
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      sortBy,
      order,
    },
  };
}

export async function getProductById(id) {
  return prisma.product.findUnique({ where: { id } });
}
