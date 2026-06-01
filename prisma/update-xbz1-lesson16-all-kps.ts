import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

type MindNode = { content: string; children?: MindNode[] };

function n(content: string, children?: MindNode[]): MindNode {
  return children ? { content, children } : { content };
}

// 知识点1：中国古代赋税制度演变（已更新）
const kp1Map: MindNode = n("第16课 中国赋税制度的演变", [
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

// 知识点2：中国古代赋税制度演变规律
const kp2Map: MindNode = n("中国古代赋税制度演变规律", [
  n("一、征税标准演变", [
    n("战国至唐前期：以人丁为主要征税标准"),
    n("唐后期至明清：以资产（土地）为主要征税标准"),
    n("演变原因：土地私有制发展，均田制破坏"),
  ]),
  n("二、征税形式演变", [
    n("先秦至唐前期：以实物和劳役为主"),
    n("唐后期至明清：逐步转向货币税"),
    n("关键节点：一条鞭法（明朝）推动白银货币化"),
  ]),
  n("三、人身控制演变", [
    n("战国至唐前期：严格的人身控制，禁止自由迁徙"),
    n("唐后期至明清：人身控制逐步放松"),
    n("关键节点：摊丁入亩（清朝）彻底废除人头税"),
  ]),
  n("四、征税时间演变", [
    n("先秦至唐前期：征税时间不固定"),
    n("唐后期至明清：征税时间固定化（两税法分夏秋两季）"),
  ]),
  n("五、演变规律总结", [
    n("趋势：从人丁税为主→资产税为主"),
    n("趋势：从实物劳役→货币"),
    n("趋势：人身控制逐步放松"),
    n("本质：封建商品经济不断发展，国家对农民的人身依附关系持续弱化"),
  ]),
]);

// 知识点3：赋税变革反映的社会经济变化
const kp3Map: MindNode = n("赋税变革反映的社会经济变化", [
  n("一、经济结构变化", [
    n("从农业为主→农商并重"),
    n("从自给自足→商品经济发展"),
    n("从自然经济→市场经济萌芽"),
  ]),
  n("二、社会结构变化", [
    n("从严格等级→流动性增强"),
    n("从人身依附→相对自由"),
    n("从农业人口→工商业人口增加"),
  ]),
  n("三、国家治理变化", [
    n("从直接控制→间接调控"),
    n("从人头税为主→财产税为主"),
    n("从实物征收→货币征收"),
  ]),
  n("四、历史影响", [
    n("积极：促进商品经济发展，推动社会进步"),
    n("积极：放松人身控制，提高农民生产积极性"),
    n("消极：土地兼并加剧，贫富分化扩大"),
    n("消极：封建制度逐渐走向衰落"),
  ]),
]);

async function main() {
  console.log("开始更新选择性必修1第16课所有知识点思维导图...\n");

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
    include: { knowledgePoints: { orderBy: { sortOrder: "asc" } } },
  });

  if (!lesson) {
    console.error("未找到第16课");
    return;
  }

  const maps = [kp1Map, kp2Map, kp3Map];
  let updated = 0;

  for (let i = 0; i < lesson.knowledgePoints.length; i++) {
    const kp = lesson.knowledgePoints[i];
    const mapData = maps[i];
    if (!mapData) continue;

    await db.knowledgePoint.update({
      where: { id: kp.id },
      data: { mindMapJson: mapData },
    });

    console.log(`知识点${i + 1}: ${kp.title} → 思维导图已更新`);
    updated++;
  }

  console.log(`\n更新完成！共更新 ${updated} 个知识点`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());