import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

type MindNode = { content: string; children?: MindNode[] };

function n(content: string, children?: MindNode[]): MindNode {
  return children ? { content, children } : { content };
}

// 根据知识点内容创建思维导图的函数
function createMindMapFromContent(title: string, content: any): MindNode {
  // 解析内容
  const paragraphs = content?.content || [];
  const sections: { title: string; items: string[] }[] = [];
  let currentSection = { title: title, items: [] as string[] };

  for (const para of paragraphs) {
    const text = para.content?.[0]?.text || "";
    if (!text) continue;

    // 检查是否是新章节
    if (text.startsWith("【") && text.endsWith("】")) {
      if (currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: text.slice(1, -1), items: [] };
    } else {
      currentSection.items.push(text);
    }
  }

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  // 如果没有明确的章节结构，创建简单的思维导图
  if (sections.length === 0) {
    const items = paragraphs
      .map((p: any) => p.content?.[0]?.text || "")
      .filter((t: string) => t);
    if (items.length > 0) {
      sections.push({ title: title, items });
    }
  }

  // 创建思维导图节点
  const children: MindNode[] = sections.map((section) => {
    if (section.items.length === 1) {
      return n(section.items[0]);
    }
    return n(section.title, section.items.map((item) => n(item)));
  });

  return n(title, children);
}

async function main() {
  console.log("开始批量更新思维导图...\n");

  // 获取所有教材
  const textbooks = await db.textbook.findMany({
    orderBy: { sortOrder: "asc" },
  });

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const textbook of textbooks) {
    console.log(`\n处理教材: ${textbook.title}`);

    // 获取该教材的所有课程
    const lessons = await db.lesson.findMany({
      where: { unit: { textbookId: textbook.id } },
      orderBy: { lessonNumber: "asc" },
      include: {
        knowledgePoints: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    for (const lesson of lessons) {
      for (const kp of lesson.knowledgePoints) {
        // 如果已经有思维导图，跳过
        if (kp.mindMapJson) {
          totalSkipped++;
          continue;
        }

        // 如果没有内容，跳过
        if (!kp.content) {
          console.log(`  跳过: ${kp.title} (无内容)`);
          totalSkipped++;
          continue;
        }

        // 创建思维导图
        const mindMap = createMindMapFromContent(kp.title, kp.content);

        // 更新数据库
        await db.knowledgePoint.update({
          where: { id: kp.id },
          data: { mindMapJson: mindMap },
        });

        console.log(`  更新: ${kp.title}`);
        totalUpdated++;
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`更新完成！`);
  console.log(`已更新: ${totalUpdated} 个知识点`);
  console.log(`已跳过: ${totalSkipped} 个知识点`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());