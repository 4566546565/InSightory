import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function countNodes(node: any): number {
  if (!node) return 0;
  let count = 1;
  if (node.children) for (const child of node.children) count += countNodes(child);
  return count;
}

async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修2" } },
  });
  if (!textbook) { console.error("未找到教材"); return; }

  console.log("=== 选择性必修2 最终验证 ===\n");

  const lessons = await db.lesson.findMany({
    where: { unit: { textbookId: textbook.id } },
    orderBy: { lessonNumber: "asc" },
    include: { knowledgePoints: { orderBy: { sortOrder: "asc" } } },
  });

  let issues: string[] = [];

  for (const l of lessons) {
    const hasContent = l.content !== null;
    const kpCount = l.knowledgePoints.length;
    const firstKP = l.knowledgePoints[0];
    const hasMindMap = firstKP?.mindMapJson !== null;
    const mindMapNodes = hasMindMap ? countNodes(firstKP.mindMapJson) : 0;

    let status = "OK";
    if (!hasContent) { status = "缺课程内容"; issues.push(`第${l.lessonNumber}课: 缺课程内容`); }
    if (kpCount === 0) { status = "缺知识点"; issues.push(`第${l.lessonNumber}课: 缺知识点`); }
    if (!hasMindMap) { status = "缺思维导图"; issues.push(`第${l.lessonNumber}课: 缺思维导图`); }

    const detail = `内容${hasContent ? "有" : "无"} | 知识点${kpCount}个 | 思导${hasMindMap ? mindMapNodes + "节点" : "无"}`;
    console.log(`第${l.lessonNumber}课 ${l.title}: ${status === "OK" ? detail : status}`);
  }

  console.log(`\n总计: ${lessons.length} 门课程`);
  console.log(`验证结果: ${issues.length === 0 ? "全部通过" : issues.join("; ")}`);
}

main().catch(console.error).finally(() => db.$disconnect());
