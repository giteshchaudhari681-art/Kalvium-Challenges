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

app.get("/api/missions", async (_req, res) => {
  let queryCount = 0;

  try {
    queryCount += 1;
    const missions = await prisma.mission.findMany({
      orderBy: { launchDate: "desc" },
      include: {
        crewMembers: true,
        logs: {
          orderBy: { timestamp: "desc" }
        }
      }
    });

    res.setHeader("X-Query-Count", String(queryCount));
    res.json(missions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch missions" });
  }
});

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Mission backend listening on http://localhost:${port}`);
});
