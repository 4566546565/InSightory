import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修3" } },
    include: { units: { include: { lessons: true } } },
  });
  if (!textbook) { console.error("未找到选必3"); return; }

  console.log(`教材: ${textbook.title}`);
  console.log(`现有 ${textbook.units.length} 个单元`);

  // Delete existing units and lessons
  for (const unit of textbook.units) {
    await db.lesson.deleteMany({ where: { unitId: unit.id } });
    await db.unit.delete({ where: { id: unit.id } });
  }
  console.log("已清理旧数据\n");

  // Define structure
  const units = [
    {
      title: "源远流长的中华文化", unitNumber: 1,
      lessons: [
        { title: "中华优秀传统文化的内涵与特点", num: 1 },
        { title: "中华文化的世界意义", num: 2 },
      ],
    },
    {
      title: "丰富多样的世界文化", unitNumber: 2,
      lessons: [
        { title: "古代西亚、非洲文化", num: 3 },
        { title: "欧洲文化的形成", num: 4 },
        { title: "南亚、东亚与美洲的文化", num: 5 },
      ],
    },
    {
      title: "人口迁徙、文化交融与认同", unitNumber: 3,
      lessons: [
        { title: "古代人类的迁徙和区域文化的形成", num: 6 },
        { title: "近代殖民活动和人口的跨地域转移", num: 7 },
        { title: "现代社会的移民和多元文化", num: 8 },
      ],
    },
    {
      title: "商路、贸易与文化交流", unitNumber: 4,
      lessons: [
        { title: "古代的商路、贸易与文化交流", num: 9 },
        { title: "近代以来的世界贸易与文化交流的扩展", num: 10 },
      ],
    },
    {
      title: "战争与文化交锋", unitNumber: 5,
      lessons: [
        { title: "古代战争与地域文化的演变", num: 11 },
        { title: "近代战争与西方文化的扩张", num: 12 },
        { title: "现代战争与不同文化的碰撞和交流", num: 13 },
      ],
    },
    {
      title: "文化的传承与保护", unitNumber: 6,
      lessons: [
        { title: "文化传承的多种载体及其发展", num: 14 },
        { title: "文化遗产：全人类共同的财富", num: 15 },
      ],
    },
  ];

  let totalLessons = 0;
  for (const u of units) {
    const unit = await db.unit.create({
      data: { textbookId: textbook.id, title: u.title, unitNumber: u.unitNumber, sortOrder: u.unitNumber },
    });
    for (const l of u.lessons) {
      await db.lesson.create({
        data: {
          unitId: unit.id,
          title: l.title,
          lessonNumber: l.num,
          sortOrder: l.num,
          content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: `${l.title}内容待补充` }] }] },
        },
      });
      totalLessons++;
    }
    console.log(`单元${u.unitNumber}: ${u.title} (${u.lessons.length}课)`);
  }

  console.log(`\n完成！创建 ${units.length} 个单元，${totalLessons} 课`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
