import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbooks = await db.textbook.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        orderBy: { unitNumber: "asc" },
        include: {
          lessons: {
            orderBy: { lessonNumber: "asc" },
            include: {
              knowledgePoints: {
                select: { id: true, title: true, mindMapJson: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });

  console.log("=== 知识点思维导图检查报告 ===\n");

  let totalKPs = 0;
  let kpsWithMindMap = 0;
  let kpsWithoutMindMap = 0;

  for (const textbook of textbooks) {
    console.log(`\n教材: ${textbook.title} (${textbook.volume})`);
    console.log(`${"=".repeat(60)}`);

    for (const unit of textbook.units) {
      for (const lesson of unit.lessons) {
        const kpsWith = lesson.knowledgePoints.filter(
          (kp) => kp.mindMapJson !== null
        );
        const kpsWithout = lesson.knowledgePoints.filter(
          (kp) => kp.mindMapJson === null
        );

        if (kpsWithout.length > 0) {
          console.log(`\n第${lesson.lessonNumber}课: ${lesson.title}`);
          for (const kp of kpsWithout) {
            totalKPs++;
            kpsWithoutMindMap++;
            console.log(`  ✗ ${kp.title} (无思维导图)`);
          }
          for (const kp of kpsWith) {
            totalKPs++;
            kpsWithMindMap++;
          }
        } else {
          totalKPs += lesson.knowledgePoints.length;
          kpsWithMindMap += lesson.knowledgePoints.length;
        }
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`总计: ${totalKPs} 个知识点`);
  console.log(`有思维导图: ${kpsWithMindMap} 个`);
  console.log(`无思维导图: ${kpsWithoutMindMap} 个`);
  console.log(`完成率: ${((kpsWithMindMap / totalKPs) * 100).toFixed(1)}%`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());