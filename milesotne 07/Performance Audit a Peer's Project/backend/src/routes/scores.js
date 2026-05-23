const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

// Issue B2: Over-fetching (includes strategyNote)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(Number.parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const [scores, total] = await Promise.all([
      prisma.score.findMany({
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.score.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      scores,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

module.exports = router;
