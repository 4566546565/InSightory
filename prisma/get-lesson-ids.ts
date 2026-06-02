import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbooks = await db.textbook.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        include: {
          lessons: {
            orderBy: { lessonNumber: "asc" },
            select: { id: true, title: true, lessonNumber: true },
            take: 1,
          },
        },
      },
    },
  });

  for (const t of textbooks) {
    console.log(`\n${t.title}:`);
    for (const u of t.units) {
      const lesson = u.lessons[0];
      if (lesson) {
        console.log(`  /knowledge/${t.id}/${u.id}/${lesson.id} - 第${lesson.lessonNumber}课 ${lesson.title}`);
      }
    }
  }
}

main().catch(console.error).finally(() => db.$disconnect());