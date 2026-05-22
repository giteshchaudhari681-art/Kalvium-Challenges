const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }]
});

prisma.$on("query", (event) => {
  console.log(`[prisma] ${event.query}`);
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/missions", async (req, res) => {
  let queryCount = 0;

  try {
    const rawPage = Number(req.query.page || 1);
    const rawLimit = Number(req.query.limit || 200);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 200;
    const skip = (page - 1) * limit;
    const isPaginatedRequest = Boolean(req.query.page || req.query.limit);

    queryCount += 1;
    const total = await prisma.mission.count();

    queryCount += 1;
    const missions = await prisma.mission.findMany({
      skip,
      take: limit,
      orderBy: { launchDate: "desc" },
      ...(isPaginatedRequest
        ? {
            select: {
              id: true,
              name: true,
              launchDate: true,
              rocket: true,
              crewMembers: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              },
              logs: {
                select: {
                  id: true,
                  event: true,
                  level: true,
                  timestamp: true
                },
                orderBy: { timestamp: "desc" }
              }
            }
          }
        : {
            include: {
              crewMembers: true,
              logs: {
                orderBy: { timestamp: "desc" }
              }
            }
          })
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const payload = {
      data: missions,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    res.setHeader("X-Query-Count", String(queryCount));
    res.json(isPaginatedRequest ? payload : missions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch missions" });
  }
});

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Mission backend listening on http://localhost:${port}`);
});
