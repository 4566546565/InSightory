import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbooks = await db.textbook.findMany({
    include: {
      units: {
        include: {
          lessons: {
            include: {
              _count: { select: { knowledgePoints: true } },
            },
            orderBy: { lessonNumber: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  let totalLessons = 0;
  let lessonsWithLessThan3 = 0;
  const needsFix: { textbook: string; lessonId: string; lessonTitle: string; lessonNum: number; kpCount: number }[] = [];

  for (const textbook of textbooks) {
    console.log(`\n${textbook.title} (${textbook.volume || ''})`);
    console.log("─".repeat(60));

    for (const unit of textbook.units) {
      for (const lesson of unit.lessons) {
        totalLessons++;
        const kpCount = lesson._count.knowledgePoints;
        const status = kpCount >= 3 ? "✓" : "✗";
        console.log(`  ${status} 第${lesson.lessonNumber}课 ${lesson.title} | 知识点: ${kpCount}`);

        if (kpCount < 3) {
          lessonsWithLessThan3++;
          needsFix.push({
            textbook: textbook.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonNum: lesson.lessonNumber,
            kpCount,
          });
        }
      }
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log(`总计: ${totalLessons} 课`);
  console.log(`知识点不足3个的课程: ${lessonsWithLessThan3} 课`);

  if (needsFix.length > 0) {
    console.log("\n需要补充知识点的课程:");
    for (const item of needsFix) {
      console.log(`  - [${item.textbook}] 第${item.lessonNum}课 ${item.lessonTitle} (当前${item.kpCount}个)`);
    }
  } else {
    console.log("\n所有课程知识点均>=3个 ✓");
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
