import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

type MindNode = { content: string; children?: MindNode[] };

function n(content: string, children?: MindNode[]): MindNode {
  return children ? { content, children } : { content };
}

// 第16课 中国赋税制度的演变 - 更详细的思维导图
const lesson16Map: MindNode = n("第16课 中国赋税制度的演变", [
  n("一、中国古代赋税制度演变", [
    n("1. 春秋时期：初税亩", [
      n("背景：铁犁牛耕推广，私田大量开垦"),
      n("内容：无论公田私田，一律按亩纳税"),
      n("实质：承认土地私有，推动井田制瓦解"),
    ]),
    n("2. 汉朝：编户齐民制度", [
      n("人头税：口赋（儿童）和算赋（成人）"),
      n("田租：三十税一，较轻"),
      n("徭役：更卒、正卒、戍卒"),
      n("特点：人头税占比极高，人身控制严格"),
    ]),
    n("3. 唐前期：租庸调制", [
      n("租：每丁每年缴纳粟二石"),
      n("调：每丁每年缴纳绢二丈、绵三两"),
      n("庸：每丁每年服役二十天，若不服役可纳绢代役"),
      n("意义：保证农民生产时间，促进农业发展"),
    ]),
    n("4. 唐后期：两税法", [
      n("背景：均田制破坏，租庸调制无法维持"),
      n("内容：一年分夏秋两季征税"),
      n("征税标准：从人丁为主转变为资产和田亩为主"),
      n("意义：人头税开始松弛，人身控制逐步放松"),
    ]),
    n("5. 明朝：一条鞭法", [
      n("背景：商品经济发展，白银流通"),
      n("内容：赋役合并，一概折银"),
      n("意义：实物税转为货币税，极大推动白银货币化"),
    ]),
    n("6. 清朝：摊丁入亩", [
      n("背景：康熙帝'滋生人丁永不加赋'"),
      n("内容：将丁银摊入田赋征收，彻底废除人头税"),
      n("意义：国家对百姓人身控制彻底放松，刺激人口快速增长"),
    ]),
  ]),
  n("二、赋税演变总趋势", [
    n("征税标准：人丁→田亩资产"),
    n("征税形式：实物、劳役→货币"),
    n("人身控制：逐步放松"),
    n("征税时间：不定时→定时"),
  ]),
  n("三、赋税变革反映的社会经济变化", [
    n("本质：封建商品经济不断发展"),
    n("表现：国家对农民的人身依附关系持续弱化"),
    n("影响：促进商品经济发展，推动社会进步"),
  ]),
]);

async function main() {
  console.log("开始更新选择性必修1第16课思维导图...\n");

  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修1" } },
  });
  if (!textbook) {
    console.error("未找到选择性必修1教材");
    return;
  }

  const lesson = await db.lesson.findFirst({
    where: {
      unit: { textbookId: textbook.id },
      lessonNumber: 16,
    },
    include: { knowledgePoints: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  if (!lesson) {
    console.error("未找到第16课");
    return;
  }

  if (lesson.knowledgePoints.length === 0) {
    console.error("第16课无知识点");
    return;
  }

  const kpId = lesson.knowledgePoints[0].id;
  await db.knowledgePoint.update({
    where: { id: kpId },
    data: { mindMapJson: lesson16Map },
  });

  console.log(`第16课: ${lesson.title} → 知识点「${lesson.knowledgePoints[0].title}」思维导图已更新`);
  console.log("更新完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());