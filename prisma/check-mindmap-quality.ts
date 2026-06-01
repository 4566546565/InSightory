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

  console.log("=== 思维导图质量检查报告 ===\n");

  let totalLessons = 0;
  let goodLessons = 0;
  let poorLessons = 0;

  for (const textbook of textbooks) {
    console.log(`\n教材: ${textbook.title} (${textbook.volume})`);
    console.log(`${"=".repeat(60)}`);

    for (const unit of textbook.units) {
      for (const lesson of unit.lessons) {
        totalLessons++;
        const kpsWithMindMap = lesson.knowledgePoints.filter(
          (kp) => kp.mindMapJson !== null
        );

        if (kpsWithMindMap.length === 0) {
          poorLessons++;
          console.log(`✗ 第${lesson.lessonNumber}课: ${lesson.title} (无思维导图)`);
          continue;
        }

        // 检查第一个知识点的思维导图质量
        const kp = kpsWithMindMap[0];
        const nodes = countNodes(kp.mindMapJson);
        const depth = maxDepth(kp.mindMapJson);

        if (nodes >= 8 && depth >= 3) {
          goodLessons++;
          console.log(`✓ 第${lesson.lessonNumber}课: ${lesson.title} (${nodes}个节点, 深度${depth})`);
        } else {
          poorLessons++;
          console.log(`△ 第${lesson.lessonNumber}课: ${lesson.title} (${nodes}个节点, 深度${depth}) - 内容偏少`);
        }
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`总计: ${totalLessons} 课`);
  console.log(`内容充足: ${goodLessons} 课`);
  console.log(`内容偏少: ${poorLessons} 课`);
  console.log(`质量达标率: ${((goodLessons / totalLessons) * 100).toFixed(1)}%`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());