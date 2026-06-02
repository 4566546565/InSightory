import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修3" } },
    include: {
      units: {
        include: {
          lessons: {
            include: {
              knowledgePoints: { select: { id: true, title: true, content: true } },
              _count: { select: { knowledgePoints: true } },
            },
            orderBy: { lessonNumber: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!textbook) { console.log("未找到选必3"); return; }

  console.log(`教材: ${textbook.title} (sortOrder: ${textbook.sortOrder})`);
  console.log(`共 ${textbook.units.length} 个单元\n`);

  for (const unit of textbook.units) {
    console.log(`单元${unit.unitNumber}: ${unit.title} (${unit.lessons.length}课)`);
    for (const lesson of unit.lessons) {
      const hasContent = lesson.content !== null;
      const kpCount = lesson._count.knowledgePoints;
      const contentLen = hasContent ? JSON.stringify(lesson.content).length : 0;
      console.log(`  第${lesson.lessonNumber}课 ${lesson.title} | 内容: ${hasContent ? contentLen + '字符' : '无'} | 知识点: ${kpCount}`);
      for (const kp of lesson.knowledgePoints) {
        const kpContentLen = kp.content ? JSON.stringify(kp.content).length : 0;
        console.log(`    KP: ${kp.title} (${kpContentLen}字符)`);
      }
    }
    console.log();
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
