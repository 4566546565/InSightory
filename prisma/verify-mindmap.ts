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
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修1" } },
  });
  if (!textbook) { console.error("未找到教材"); return; }

  const lessons = await db.lesson.findMany({
    where: { unit: { textbookId: textbook.id } },
    orderBy: { lessonNumber: "asc" },
    include: { knowledgePoints: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  let totalNodes = 0;
  let allGood = true;

  for (const lesson of lessons) {
    const kp = lesson.knowledgePoints[0];
    if (!kp || !kp.mindMapJson) {
      console.log(`第${lesson.lessonNumber}课: 无思维导图`);
      allGood = false;
      continue;
    }
    const nodes = countNodes(kp.mindMapJson);
    const depth = maxDepth(kp.mindMapJson);
    totalNodes += nodes;
    const status = nodes >= 5 && depth >= 3 ? "OK" : "偏少";
    if (status === "偏少") allGood = false;
    console.log(`第${lesson.lessonNumber}课: ${nodes} 个节点, 深度 ${depth} ${status}`);
  }

  console.log(`\n总计: ${totalNodes} 个节点`);
  console.log(`验证: ${allGood ? "全部通过" : "部分课程内容偏少"}`);
}

main().catch(console.error).finally(() => db.$disconnect());
