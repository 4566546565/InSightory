import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修3" } },
    include: {
      units: {
        include: {
          lessons: {
            include: {
              knowledgePoints: {
                select: { id: true, title: true, mindMapJson: true },
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
            orderBy: { lessonNumber: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!textbook) { console.log("未找到选必3"); return; }

  console.log(`教材: ${textbook.title}`);
  console.log(`共 ${textbook.units.length} 个单元\n`);

  function countNodes(node: any): number {
    let c = 1;
    if (node.children) for (const ch of node.children) c += countNodes(ch);
    return c;
  }

  for (const unit of textbook.units) {
    console.log(`单元${unit.unitNumber}: ${unit.title}`);
    for (const lesson of unit.lessons) {
      const kp = lesson.knowledgePoints[0];
      if (kp?.mindMapJson) {
        const nodes = countNodes(kp.mindMapJson);
        console.log(`  第${lesson.lessonNumber}课 ${lesson.title} | 思维导图: ${nodes}个节点`);
      } else {
        console.log(`  第${lesson.lessonNumber}课 ${lesson.title} | 思维导图: 无`);
      }
    }
    console.log();
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
