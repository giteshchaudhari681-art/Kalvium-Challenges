import { Profiler, useEffect, useRef, useState } from "react";
import axios from "axios";
import { MissionCard } from "./MissionCard";

const api = axios.create({
  baseURL: "http://localhost:4000"
});

const profilerMetrics = {
  commits: [],
  maxCommitDuration: 0
};

if (typeof window !== "undefined") {
  window.__MISSION_METRICS = profilerMetrics;
}

function heavyScore(mission, searchTerm) {
  let score = 0;
  const haystack = `${mission.name} ${mission.rocket} ${mission.destination} ${mission.description} ${mission.crewMembers
    .map((member) => member.name)
    .join(" ")} ${mission.logs.map((log) => log.event).join(" ")}`.toLowerCase();

  for (let index = 0; index < 200; index += 1) {
    score += haystack.includes(searchTerm) ? 1 : 0;
    score += haystack.charCodeAt(index % haystack.length) || 0;
  }

  return score;
}

export default function App() {
  const [missions, setMissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const measurementSentRef = useRef(false);
  const measurementSearchTriggeredRef = useRef(false);
  const measurementParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const measurementMode = measurementParams?.get("measure") === "1";
  const measurementRunId = measurementParams?.get("runId");

  useEffect(() => {
    async function fetchMissions() {
      setLoading(true);
      const response = await api.get("/api/missions");
      setMissions(response.data);
      setLoading(false);
    }

    fetchMissions();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredAndSortedMissions = missions
    .filter((mission) => {
      if (!normalizedSearch) {
        heavyScore(mission, normalizedSearch);
        return true;
      }

      return heavyScore(mission, normalizedSearch) > 0;
    })
    .sort((left, right) => {
      const leftScore = heavyScore(left, normalizedSearch);
      const rightScore = heavyScore(right, normalizedSearch);
      return rightScore - leftScore;
    });

  const handleProfilerRender = (_id, _phase, actualDuration) => {
    profilerMetrics.commits.push(actualDuration);
    profilerMetrics.maxCommitDuration = Math.max(
      profilerMetrics.maxCommitDuration,
      actualDuration
    );
  };

  useEffect(() => {
    if (!measurementMode || loading || measurementSearchTriggeredRef.current) {
      return;
    }

    measurementSearchTriggeredRef.current = true;
    const timeoutId = window.setTimeout(() => {
      setSearchTerm("mars");
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [loading, measurementMode]);

  useEffect(() => {
    if (
      !measurementMode ||
      loading ||
      !measurementSearchTriggeredRef.current ||
      searchTerm !== "mars" ||
      measurementSentRef.current
    ) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      measurementSentRef.current = true;
      const payload = {
        runId: measurementRunId,
        commitDurationMs: profilerMetrics.maxCommitDuration,
        domNodes: document.querySelectorAll("*").length
      };

      await fetch("http://localhost:4000/api/client-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [loading, measurementMode, measurementRunId, searchTerm]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Mission Control</p>
          <h1>Space Mission Logs</h1>
          <p className="subtitle">
            Tracking every active and historical mission with live crew and event
            summaries.
          </p>
        </div>
        <div className="search-panel">
          <label htmlFor="mission-search">Search missions</label>
          <input
            id="mission-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by rocket, destination, crew, event..."
          />
          <span>{filteredAndSortedMissions.length} missions shown</span>
        </div>
      </header>

      <Profiler id="MissionList" onRender={handleProfilerRender}>
        <main className="mission-grid">
          {loading ? <p className="status">Loading missions...</p> : null}
          {!loading
            ? filteredAndSortedMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onDelete={(id) =>
                    setMissions((current) =>
                      current.filter((item) => item.id !== id)
                    )
                  }
                  style={{ marginBottom: "8px" }}
                />
              ))
            : null}
        </main>
      </Profiler>
    </div>
  );
}
