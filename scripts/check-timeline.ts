import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const count = await db.timelineEvent.count();
  console.log(`Total events: ${count}`);
  const chinaCount = await db.timelineEvent.count({ where: { category: "CHINA" } });
  const worldCount = await db.timelineEvent.count({ where: { category: "WORLD" } });
  console.log(`China: ${chinaCount}, World: ${worldCount}`);
  // Show first few events
  const first = await db.timelineEvent.findMany({ orderBy: { startDate: "asc" }, take: 5 });
  for (const e of first) {
    console.log(`  ${e.startDate} - ${e.title} (${e.category})`);
  }
  await db.$disconnect();
}
main();
