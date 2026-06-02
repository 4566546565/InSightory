import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // 获取中外历史纲要（上）第一课
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "中外历史纲要（上）" } },
  });

  const lesson = await db.lesson.findFirst({
    where: {
      unit: { textbookId: textbook!.id },
      lessonNumber: 1,
    },
    include: {
      knowledgePoints: {
        select: { id: true, title: true, mindMapJson: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!lesson) {
    console.log("未找到第1课");
    return;
  }

  console.log(`课程: ${lesson.title}`);
  console.log(`知识点数量: ${lesson.knowledgePoints.length}`);

  // 检查第一个知识点的思维导图
  const firstKP = lesson.knowledgePoints[0];
  console.log(`\n第一个知识点: ${firstKP.title}`);
  console.log(`思维导图: ${firstKP.mindMapJson ? '有' : '无'}`);

  if (firstKP.mindMapJson) {
    const data = firstKP.mindMapJson as any;
    console.log(`根节点内容: ${data.content}`);
    console.log(`子节点数量: ${data.children?.length || 0}`);

    // 计算总节点数
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

    const totalNodes = countNodes(data);
    console.log(`总节点数: ${totalNodes}`);
  }

  // 检查所有知识点的思维导图
  console.log(`\n所有知识点思维导图状态:`);
  for (const kp of lesson.knowledgePoints) {
    console.log(`  ${kp.title}: ${kp.mindMapJson ? '有' : '无'}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());