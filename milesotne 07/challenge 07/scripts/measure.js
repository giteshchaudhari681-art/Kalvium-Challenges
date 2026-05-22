const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const reportPath = path.join(root, "metrics.json");

function request(url, headers = []) {
  const headerArgs = headers.flatMap((header) => ["-H", header]);
  return execFileSync(
    "curl.exe",
    [
      "-s",
      "--compressed",
      "-D",
      "-",
      "-o",
      "NUL",
      ...headerArgs,
      "-w",
      "\\nTIME:%{time_total}\\nSIZE:%{size_download}\\n",
      url
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 8 }
  );
}

async function main() {
  const missionsPath = process.env.MISSIONS_PATH || "/api/missions";
  const backendUrl = `http://localhost:4000${missionsPath}`;
  const frontendUrl = "http://localhost:5173";

  const backendRaw = request(backendUrl);
  const queryMatch = backendRaw.match(/x-query-count:\s*(\d+)/i);
  const timeMatch = backendRaw.match(/TIME:(\d+\.\d+)/);
  const sizeMatch = backendRaw.match(/SIZE:(\d+)/);

  let uiMetrics = {
    commitDuration: null,
    domNodes: null
  };

  try {
    const { chromium } = require("playwright");
    const browser = await chromium.launch({
      headless: true,
      channel: "msedge"
    });
    const page = await browser.newPage();
    await page.goto(frontendUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#mission-search", { timeout: 30000 });
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".mission-card").length > 0 ||
        !document.querySelector(".status"),
      { timeout: 30000 }
    );
    await page.waitForTimeout(2000);
    await page.fill("#mission-search", "mars");
    await page.waitForTimeout(1500);
    uiMetrics = await page.evaluate(() => ({
      commitDuration: window.__MISSION_METRICS?.maxCommitDuration ?? null,
      domNodes: document.querySelectorAll("*").length
    }));
    await browser.close();
  } catch (error) {
    console.warn("Playwright measurement skipped:", error.message);
  }

  const metrics = {
    responseTimeMs: timeMatch ? Number(timeMatch[1]) * 1000 : null,
    payloadBytes: sizeMatch ? Number(sizeMatch[1]) : null,
    queryCount: queryMatch ? Number(queryMatch[1]) : null,
    commitDurationMs: uiMetrics.commitDuration,
    domNodes: uiMetrics.domNodes
  };

  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
  console.log(JSON.stringify(metrics, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
