import { Profiler, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MissionCard } from "./MissionCard";

const api = axios.create({
  baseURL: "http://localhost:4000"
});

const missionCardSpacing = { marginBottom: "8px" };

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

  for (let i = 0; i < 200; i += 1) {
    score += haystack.includes(searchTerm) ? 1 : 0;
    score += haystack.charCodeAt(i % haystack.length) || 0;
  }

  return score;
}

export default function App() {
  const [missions, setMissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMissions() {
      setLoading(true);
      const response = await api.get("/api/missions");
      setMissions(response.data);
      setLoading(false);
    }

    fetchMissions();
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredAndSortedMissions = useMemo(
    () =>
      missions
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
        }),
    [missions, normalizedSearch]
  );

  const handleProfilerRender = (_id, _phase, actualDuration) => {
    profilerMetrics.commits.push(actualDuration);
    profilerMetrics.maxCommitDuration = Math.max(
      profilerMetrics.maxCommitDuration,
      actualDuration
    );
  };

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
                  style={missionCardSpacing}
                />
              ))
            : null}
        </main>
      </Profiler>
    </div>
  );
}
