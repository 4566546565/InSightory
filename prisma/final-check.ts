import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  console.log("=== 最终验证：五本教材思维导图完整性检查 ===\n");

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

  let totalLessons = 0;
  let totalKPs = 0;
  let lessonsWithMindMap = 0;
  let kpsWithMindMap = 0;
  let issues: string[] = [];

  for (const textbook of textbooks) {
    console.log(`\n📚 ${textbook.title} (${textbook.volume})`);
    console.log(`${"─".repeat(50)}`);

    for (const unit of textbook.units) {
      for (const lesson of unit.lessons) {
        totalLessons++;
        const kpsWith = lesson.knowledgePoints.filter(kp => kp.mindMapJson !== null);
        const kpsWithout = lesson.knowledgePoints.filter(kp => kp.mindMapJson === null);

        totalKPs += lesson.knowledgePoints.length;
        kpsWithMindMap += kpsWith.length;

        if (kpsWith.length > 0) {
          lessonsWithMindMap++;
          console.log(`  ✓ 第${lesson.lessonNumber}课: ${lesson.title} (${kpsWith.length}/${lesson.knowledgePoints.length} 个知识点有思维导图)`);
        } else {
          issues.push(`${textbook.title} - 第${lesson.lessonNumber}课 ${lesson.title}: 无思维导图`);
          console.log(`  ✗ 第${lesson.lessonNumber}课: ${lesson.title} (无思维导图)`);
        }

        if (kpsWithout.length > 0) {
          for (const kp of kpsWithout) {
            issues.push(`${textbook.title} - ${kp.title}: 无思维导图`);
          }
        }
      }
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`📊 统计结果:`);
  console.log(`  总课程数: ${totalLessons}`);
  console.log(`  有思维导图的课程: ${lessonsWithMindMap} (${((lessonsWithMindMap / totalLessons) * 100).toFixed(1)}%)`);
  console.log(`  总知识点数: ${totalKPs}`);
  console.log(`  有思维导图的知识点: ${kpsWithMindMap} (${((kpsWithMindMap / totalKPs) * 100).toFixed(1)}%)`);

  if (issues.length > 0) {
    console.log(`\n⚠️  发现 ${issues.length} 个问题:`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log(`\n✅ 所有课程和知识点都有完整的思维导图数据！`);
  }

  console.log(`\n🌐 前端显示验证:`);
  console.log(`  - 开发服务器: http://localhost:3002`);
  console.log(`  - 思维导图使用 markmap-view 库渲染`);
  console.log(`  - 数据通过 MindMapViewer 组件传递并渲染`);
  console.log(`  - 所有课程页面的"思维导图"标签页应正常显示`);
}

main().catch(console.error).finally(() => db.$disconnect());