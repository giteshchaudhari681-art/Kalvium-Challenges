import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { prisma } from './prisma.config';

const app = express();
const PORT = process.env.PORT || 3001;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/api/orders', async (req, res) => {
  try {
    const pageParam = Number.parseInt(String(req.query.page ?? DEFAULT_PAGE), 10);
    const limitParam = Number.parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10);
    const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : DEFAULT_PAGE;
    const limit = Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_LIMIT)
      : DEFAULT_LIMIT;
    const skip = (currentPage - 1) * limit;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          status: true,
          total: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          items: {
            select: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      orders,
      pagination: {
        currentPage,
        limit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'optimized' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});