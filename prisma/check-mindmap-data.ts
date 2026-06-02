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

  console.log(`教材: ${textbook.title}\n`);

  for (const unit of textbook.units) {
    for (const lesson of unit.lessons) {
      console.log(`第${lesson.lessonNumber}课 ${lesson.title}`);
      for (const kp of lesson.knowledgePoints) {
        const hasMindMap = kp.mindMapJson !== null;
        const mindMapType = hasMindMap ? typeof kp.mindMapJson : 'null';
        const mindMapKeys = hasMindMap && typeof kp.mindMapJson === 'object' ? Object.keys(kp.mindMapJson as object) : [];
        console.log(`  KP: ${kp.title} | mindMapJson: ${hasMindMap ? '有' : '无'} (${mindMapType}) | keys: ${mindMapKeys.join(', ')}`);
      }
      console.log();
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
