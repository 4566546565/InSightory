import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbooks = await db.textbook.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        orderBy: { unitNumber: "asc" },
        include: {
          _count: { select: { lessons: true } },
        },
      },
      _count: { select: { units: true } },
    },
  });

  for (const t of textbooks) {
    console.log(`\n教材: ${t.title} (${t.volume}) [sortOrder=${t.sortOrder}] id=${t.id}`);
    console.log(`  单元数: ${t._count.units}`);
    for (const u of t.units) {
      console.log(`  第${u.unitNumber}单元: ${u.title} (${u._count.lessons}课)`);
    }
  }

  if (textbooks.length === 0) console.log("数据库中没有任何教材");
}

main().catch(console.error).finally(() => db.$disconnect());
