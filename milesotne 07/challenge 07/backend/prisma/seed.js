const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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
  return Array.from({ length: 22 }, (_, index) =>
    `Mission ${seed} telemetry segment ${index + 1} confirms subsystem stability during extended mission rehearsal and cross-team operations.`
  ).join(" ");
}

async function main() {
  await prisma.missionLog.deleteMany();
  await prisma.crewMember.deleteMany();
  await prisma.mission.deleteMany();

  for (let missionIndex = 1; missionIndex <= 200; missionIndex += 1) {
    const crewCount = 2 + (missionIndex % 4);
    const logCount = 5 + (missionIndex % 6);
    const launchDate = new Date(Date.UTC(2020 + (missionIndex % 6), missionIndex % 12, (missionIndex % 27) + 1));

    await prisma.mission.create({
      data: {
        name: `Mission ${missionIndex.toString().padStart(3, "0")}`,
        launchDate,
        rocket: rockets[missionIndex % rockets.length],
        destination: destinations[missionIndex % destinations.length],
        status: statuses[missionIndex % statuses.length],
        description: repeatParagraph(missionIndex),
        crewMembers: {
          create: Array.from({ length: crewCount }, (_, crewIndex) => ({
            name: `Crew ${missionIndex}-${crewIndex + 1}`,
            role: crewRoles[(missionIndex + crewIndex) % crewRoles.length]
          }))
        },
        logs: {
          create: Array.from({ length: logCount }, (_, logIndex) => ({
            event: `${logEvents[(missionIndex + logIndex) % logEvents.length]} for mission ${missionIndex}`,
            level: logLevels[(missionIndex + logIndex) % logLevels.length],
            timestamp: new Date(launchDate.getTime() + (logIndex + 1) * 36e5)
          }))
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
