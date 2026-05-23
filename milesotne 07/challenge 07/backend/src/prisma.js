const destinations = [
  "Low Earth Orbit",
  "Moon",
  "Mars",
  "Europa",
  "Titan",
  "Asteroid Belt"
];

const statuses = ["Scheduled", "Active", "Completed", "Standby"];
const rockets = [
  "Atlas V",
  "Falcon Heavy",
  "Starship",
  "SLS",
  "Ariane 6",
  "New Glenn"
];
const crewRoles = ["Commander", "Pilot", "Engineer", "Scientist", "Medic"];
const logLevels = ["info", "warning", "critical"];
const logEvents = [
  "Launch window confirmed",
  "Docking sequence complete",
  "Solar array deployed",
  "Trajectory correction burn",
  "Crew medical check complete",
  "Surface scan transmitted",
  "Communication relay stabilised",
  "Fuel reserves recalculated",
  "Landing rehearsal started",
  "Navigation systems calibrated"
];

function repeatParagraph(seed) {
  return Array.from({ length: 28 }, (_, index) =>
    `Mission ${seed} telemetry segment ${index + 1} confirms subsystem stability during extended mission rehearsal and cross-team operations.`
  ).join(" ");
}

function createSeedData() {
  const missions = [];
  const crewMembers = [];
  const logs = [];

  let crewId = 1;
  let logId = 1;

  for (let missionIndex = 1; missionIndex <= 200; missionIndex += 1) {
    const crewCount = 2 + (missionIndex % 4);
    const logCount = 5 + (missionIndex % 6);
    const launchDate = new Date(
      Date.UTC(2020 + (missionIndex % 6), missionIndex % 12, (missionIndex % 27) + 1)
    );

    missions.push({
      id: missionIndex,
      name: `Mission ${missionIndex.toString().padStart(3, "0")}`,
      launchDate,
      rocket: rockets[missionIndex % rockets.length],
      destination: destinations[missionIndex % destinations.length],
      status: statuses[missionIndex % statuses.length],
      description: repeatParagraph(missionIndex)
    });

    for (let index = 0; index < crewCount; index += 1) {
      crewMembers.push({
        id: crewId,
        missionId: missionIndex,
        name: `Crew ${missionIndex}-${index + 1}`,
        role: crewRoles[(missionIndex + index) % crewRoles.length]
      });
      crewId += 1;
    }

    for (let index = 0; index < logCount; index += 1) {
      logs.push({
        id: logId,
        missionId: missionIndex,
        event: `${logEvents[(missionIndex + index) % logEvents.length]} for mission ${missionIndex}`,
        level: logLevels[(missionIndex + index) % logLevels.length],
        timestamp: new Date(launchDate.getTime() + (index + 1) * 36e5)
      });
      logId += 1;
    }
  }

  return {
    missions,
    crewMembers,
    logs
  };
}

const database = createSeedData();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sortByTimestampDesc(items) {
  return [...items].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );
}

function applyMissionOrder(items, orderBy) {
  if (!orderBy?.launchDate) {
    return [...items];
  }

  const direction = orderBy.launchDate === "asc" ? 1 : -1;
  return [...items].sort(
    (left, right) =>
      direction *
      (new Date(left.launchDate).getTime() - new Date(right.launchDate).getTime())
  );
}

function projectRecord(record, selection) {
  if (!selection) {
    return { ...record };
  }

  return Object.entries(selection).reduce((result, [key, value]) => {
    if (value === true) {
      result[key] = record[key];
    }

    return result;
  }, {});
}

class FakePrismaClient {
  constructor() {
    this.queryListeners = [];

    this.mission = {
      count: async () => {
        this.#emit("SELECT COUNT(*) FROM Mission");
        await delay(2);
        return database.missions.length;
      },
      findMany: async (args = {}) => {
        this.#emit("SELECT * FROM Mission");
        await delay(2);

        let missions = applyMissionOrder(database.missions, args.orderBy);

        if (typeof args.skip === "number") {
          missions = missions.slice(args.skip);
        }

        if (typeof args.take === "number") {
          missions = missions.slice(0, args.take);
        }

        if (args.include) {
          return missions.map((mission) => ({
            ...mission,
            crewMembers: database.crewMembers.filter((member) => member.missionId === mission.id),
            logs: sortByTimestampDesc(
              database.logs.filter((log) => log.missionId === mission.id)
            )
          }));
        }

        if (args.select) {
          return missions.map((mission) => {
            const projected = projectRecord(mission, args.select);

            if (args.select.crewMembers) {
              projected.crewMembers = database.crewMembers
                .filter((member) => member.missionId === mission.id)
                .map((member) => projectRecord(member, args.select.crewMembers.select));
            }

            if (args.select.logs) {
              projected.logs = sortByTimestampDesc(
                database.logs.filter((log) => log.missionId === mission.id)
              ).map((log) => projectRecord(log, args.select.logs.select));
            }

            return projected;
          });
        }

        return missions.map((mission) => ({ ...mission }));
      }
    };

    this.crewMember = {
      findMany: async ({ where }) => {
        this.#emit(
          `SELECT * FROM CrewMember WHERE missionId = ${Number(where?.missionId || 0)}`
        );
        await delay(2);
        return database.crewMembers.filter((member) => member.missionId === where.missionId);
      }
    };

    this.missionLog = {
      findMany: async ({ where }) => {
        this.#emit(
          `SELECT * FROM MissionLog WHERE missionId = ${Number(where?.missionId || 0)}`
        );
        await delay(2);
        return sortByTimestampDesc(
          database.logs.filter((log) => log.missionId === where.missionId)
        );
      }
    };
  }

  $on(eventName, listener) {
    if (eventName === "query") {
      this.queryListeners.push(listener);
    }
  }

  #emit(query) {
    for (const listener of this.queryListeners) {
      listener({ query });
    }
  }
}

module.exports = {
  PrismaClient: FakePrismaClient
};
