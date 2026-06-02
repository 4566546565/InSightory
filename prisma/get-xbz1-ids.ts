import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修1" } },
    include: {
      units: {
        orderBy: { unitNumber: "asc" },
        include: {
          lessons: { orderBy: { lessonNumber: "asc" }, select: { id: true, lessonNumber: true, title: true } },
        },
      },
    },
  });
  if (!textbook) { console.error("未找到"); return; }
  console.log(`textbookId: ${textbook.id}`);
  for (const unit of textbook.units) {
    for (const lesson of unit.lessons) {
      console.log(`  u${unit.unitNumber} l${lesson.lessonNumber}: ${lesson.id} | ${lesson.title}`);
    }
  }
}
main().catch(console.error).finally(() => db.$disconnect());
