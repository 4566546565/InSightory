import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  try {
    const courses = await db.course.findMany({
      where: { textbook: { title: { contains: "选择性必修1" } } },
      include: {
        knowledgePoints: { select: { id: true, title: true } },
        unit: true,
      },
      orderBy: { order: "asc" },
    });

    let totalKP = 0;
    for (const c of courses) {
      console.log(`[${c.unit.title}] ${c.name}: ${c.knowledgePoints.length} 个知识点`);
      for (const kp of c.knowledgePoints) {
        console.log(`  - ${kp.title}`);
      }
      totalKP += c.knowledgePoints.length;
    }

    console.log(`\n总计: ${courses.length} 门课程, ${totalKP} 个知识点`);
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error);
