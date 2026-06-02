import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const allEvents = await db.timelineEvent.findMany({ take: 500 });

  // 按数字排序
  const sorted = allEvents.sort((a, b) => {
    const aNum = parseInt(a.startDate);
    const bNum = parseInt(b.startDate);
    return aNum - bNum;
  });

  console.log("前30个事件（按数字排序后）：");
  sorted.slice(0, 30).forEach(e => {
    console.log(`${e.startDate} - ${e.title} (${e.category})`);
  });

  // 检查是否有乱序
  let lastDate = -Infinity;
  let outOfOrder = 0;

  sorted.forEach(e => {
    const dateNum = parseInt(e.startDate);
    if (dateNum < lastDate) {
      outOfOrder++;
    }
    lastDate = dateNum;
  });

  console.log(`\n总共 ${sorted.length} 个事件`);
  console.log(`乱序事件: ${outOfOrder} 个`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
