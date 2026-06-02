import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const events = await db.timelineEvent.findMany({
    orderBy: { startDate: "asc" },
    take: 30,
  });

  console.log("前30个事件（按时间排序）：");
  events.forEach(e => {
    console.log(`${e.startDate} - ${e.title} (${e.category})`);
  });

  // 检查是否有乱序
  let lastDate = -Infinity;
  let outOfOrder = 0;
  const allEvents = await db.timelineEvent.findMany({
    orderBy: { startDate: "asc" },
  });

  allEvents.forEach(e => {
    const dateNum = parseInt(e.startDate);
    if (dateNum < lastDate) {
      outOfOrder++;
      console.log(`乱序: ${e.startDate} ${e.title} 应该在 ${lastDate} 之后`);
    }
    lastDate = dateNum;
  });

  console.log(`\n总共 ${allEvents.length} 个事件`);
  console.log(`乱序事件: ${outOfOrder} 个`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
