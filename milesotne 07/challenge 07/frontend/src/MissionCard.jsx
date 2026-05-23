export function MissionCard({ mission, onDelete, style }) {
  return (
    <article className="mission-card" style={style}>
      <div className="mission-card__top">
        <div>
          <p className="mission-card__label">{mission.rocket}</p>
          <h2>{mission.name}</h2>
        </div>
        <button className="danger-button" onClick={() => onDelete(mission.id)}>
          Remove
        </button>
      </div>

      <div className="mission-card__meta">
        <span>{new Date(mission.launchDate).toLocaleDateString()}</span>
        <span>{mission.destination}</span>
        <span>{mission.status}</span>
      </div>

      <p className="mission-card__summary">{mission.description.slice(0, 220)}...</p>

      <section>
        <h3>Crew</h3>
        <ul>
          {mission.crewMembers.map((member) => (
            <li key={member.id}>
              {member.name} · {member.role}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Recent Logs</h3>
        <ul>
          {mission.logs.slice(0, 4).map((log) => (
            <li key={log.id}>
              {log.level.toUpperCase()} · {log.event}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
