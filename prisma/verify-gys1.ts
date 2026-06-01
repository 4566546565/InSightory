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
    where: { title: { contains: "中外历史纲要（上）" } },
  });
  if (!textbook) { console.error("未找到教材"); return; }

  console.log("=== 中外历史纲要（上） 验证 ===\n");

  const units = await db.unit.findMany({
    where: { textbookId: textbook.id },
    orderBy: { unitNumber: "asc" },
  });
  console.log(`单元数: ${units.length}\n`);

  const lessons = await db.lesson.findMany({
    where: { unit: { textbookId: textbook.id } },
    orderBy: { lessonNumber: "asc" },
    include: { knowledgePoints: { orderBy: { sortOrder: "asc" } } },
  });

  let issues: string[] = [];
  let totalKPs = 0;
  let totalMindMapNodes = 0;

  for (const l of lessons) {
    const hasContent = l.content !== null;
    const kpCount = l.knowledgePoints.length;
    totalKPs += kpCount;

    let mindMapStatus = "无";
    for (const kp of l.knowledgePoints) {
      if (kp.mindMapJson) {
        const nodes = countNodes(kp.mindMapJson);
        totalMindMapNodes += nodes;
        mindMapStatus = `${nodes}节点`;
        break;
      }
    }

    let status = "OK";
    if (!hasContent) { status = "缺课程内容"; issues.push(`第${l.lessonNumber}课: 缺课程内容`); }
    if (kpCount === 0) { status = "缺知识点"; issues.push(`第${l.lessonNumber}课: 缺知识点`); }

    const detail = `内容${hasContent ? "有" : "无"} | 知识点${kpCount}个 | 思导${mindMapStatus}`;
    console.log(`第${String(l.lessonNumber).padStart(2, " ")}课 ${l.title}: ${status === "OK" ? detail : status}`);
  }

  console.log(`\n总计: ${lessons.length} 门课程, ${totalKPs} 个知识点, ${totalMindMapNodes} 个思维导图节点`);
  console.log(`验证结果: ${issues.length === 0 ? "全部通过" : issues.join("; ")}`);
}

main().catch(console.error).finally(() => db.$disconnect());
