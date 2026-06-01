import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "中外历史纲要（上）" } },
    include: {
      units: {
        orderBy: { unitNumber: "asc" },
        include: {
          lessons: { orderBy: { lessonNumber: "asc" }, select: { id: true, title: true, lessonNumber: true } },
        },
      },
    },
  });
  if (!textbook) { console.error("未找到"); return; }
  console.log(`textbookId: ${textbook.id}`);
  for (const unit of textbook.units) {
    for (const lesson of unit.lessons) {
      console.log(`  unit${unit.unitNumber} lesson${lesson.lessonNumber}: ${lesson.id} | ${lesson.title}`);
    }
  }
}
main().catch(console.error).finally(() => db.$disconnect());
