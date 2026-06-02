import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbooks = await db.textbook.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        orderBy: { unitNumber: "asc" },
        include: {
          lessons: {
            orderBy: { lessonNumber: "asc" },
            select: { id: true, title: true, lessonNumber: true },
          },
        },
      },
    },
  });

  const urls: string[] = [];
  for (const t of textbooks) {
    for (const u of t.units) {
      for (const l of u.lessons) {
        urls.push(`http://localhost:3002/knowledge/${t.id}/${u.id}/${l.id}`);
      }
    }
  }
  console.log(JSON.stringify(urls));
}

main().catch(console.error).finally(() => db.$disconnect());