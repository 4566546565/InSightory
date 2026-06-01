import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function countNodes(node: any): number {
  if (!node) return 0;
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

function maxDepth(node: any, depth = 1): number {
  if (!node || !node.children || node.children.length === 0) return depth;
  return Math.max(...node.children.map((c: any) => maxDepth(c, depth + 1)));
}

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

  console.log("=== 五本教材思维导图全面检查 ===\n");

  let totalLessons = 0;
  let totalKPs = 0;
  let okLessons = 0;
  let warnLessons = 0;
  let failLessons = 0;
  const warnings: string[] = [];
  const failures: string[] = [];

  for (const textbook of textbooks) {
    console.log(`\n${"═".repeat(70)}`);
    console.log(`📚 ${textbook.title} (${textbook.volume})`);
    console.log(`${"═".repeat(70)}`);

    for (const unit of textbook.units) {
      console.log(`\n  ── 第${unit.unitNumber}单元: ${unit.title} ──`);

      for (const lesson of unit.lessons) {
        totalLessons++;
        const kp = lesson.knowledgePoints[0];
        const allKPs = lesson.knowledgePoints;
        const kpsWith = allKPs.filter(k => k.mindMapJson !== null);
        const kpsWithout = allKPs.filter(k => k.mindMapJson === null);

        totalKPs += allKPs.length;

        if (!kp || !kp.mindMapJson) {
          failLessons++;
          failures.push(`第${lesson.lessonNumber}课 ${lesson.title} - 无思维导图`);
          console.log(`    ✗ 第${lesson.lessonNumber}课: ${lesson.title}`);
          console.log(`      状态: 无思维导图`);
          continue;
        }

        const nodes = countNodes(kp.mindMapJson);
        const depth = maxDepth(kp.mindMapJson);

        if (nodes < 5 || depth < 3) {
          warnLessons++;
          warnings.push(`第${lesson.lessonNumber}课 ${lesson.title} - ${nodes}个节点, 深度${depth} (偏少)`);
          console.log(`    △ 第${lesson.lessonNumber}课: ${lesson.title}`);
          console.log(`      状态: 内容偏少 (${nodes}个节点, 深度${depth})`);
        } else {
          okLessons++;
          console.log(`    ✓ 第${lesson.lessonNumber}课: ${lesson.title}`);
          console.log(`      状态: OK (${nodes}个节点, 深度${depth}) | ${kpsWith.length}/${allKPs.length} 知识点有思维导图`);
        }
      }
    }
  }

  console.log(`\n${"═".repeat(70)}`);
  console.log(`📊 总体统计`);
  console.log(`${"═".repeat(70)}`);
  console.log(`  总课程数: ${totalLessons}`);
  console.log(`  总知识点数: ${totalKPs}`);
  console.log(`  ✓ 正常: ${okLessons} 课`);
  console.log(`  △ 偏少: ${warnLessons} 课`);
  console.log(`  ✗ 缺失: ${failLessons} 课`);
  console.log(`  达标率: ${((okLessons / totalLessons) * 100).toFixed(1)}%`);

  if (warnings.length > 0) {
    console.log(`\n⚠️  内容偏少的课程 (${warnings.length}个):`);
    warnings.forEach(w => console.log(`  - ${w}`));
  }
  if (failures.length > 0) {
    console.log(`\n❌ 缺失思维导图的课程 (${failures.length}个):`);
    failures.forEach(f => console.log(`  - ${f}`));
  }
  if (warnings.length === 0 && failures.length === 0) {
    console.log(`\n🎉 全部通过！所有课程思维导图内容充足。`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());