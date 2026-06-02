import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  console.log("Splitting templates into individual records...");

  const guide = await db.studyGuide.findFirst({ where: { category: "答题模板" } });
  if (!guide || !guide.content) { console.log("No guide found"); await db.$disconnect(); return; }

  const doc = guide.content as any;
  const nodes: any[] = doc.content;

  // Define template sections with metadata
  const sections = [
    // 一、基础核心题型
    { startIdx: 2, endIdx: 19, title: "原因/背景/条件类", subtitle: "最高频题型", icon: "🔍", category: "基础核心题型", tags: ["原因", "背景", "条件", "必考"] },
    { startIdx: 20, endIdx: 36, title: "影响/作用/意义/危害类", subtitle: "高频必考", icon: "⚡", category: "基础核心题型", tags: ["影响", "意义", "危害", "必考"] },
    { startIdx: 37, endIdx: 42, title: "特点/特征类", subtitle: "常考题型", icon: "🏷️", category: "基础核心题型", tags: ["特点", "特征", "必考"] },
    { startIdx: 43, endIdx: 50, title: "措施/内容/表现类", subtitle: "基础题型", icon: "📋", category: "基础核心题型", tags: ["措施", "内容", "表现", "必考"] },
    // 二、高频进阶题型
    { startIdx: 52, endIdx: 62, title: "变化/发展/趋势类", subtitle: "进阶拉分", icon: "📈", category: "高频进阶题型", tags: ["变化", "发展", "趋势"] },
    { startIdx: 63, endIdx: 73, title: "比较/对比类", subtitle: "进阶拉分", icon: "⚖️", category: "高频进阶题型", tags: ["比较", "对比", "异同"] },
    { startIdx: 74, endIdx: 82, title: "目的/意图类", subtitle: "进阶题型", icon: "🎯", category: "高频进阶题型", tags: ["目的", "意图"] },
    { startIdx: 83, endIdx: 89, title: "实质/本质类", subtitle: "进阶题型", icon: "💡", category: "高频进阶题型", tags: ["实质", "本质"] },
    { startIdx: 90, endIdx: 103, title: "评价/评述类", subtitle: "综合能力", icon: "⭐", category: "高频进阶题型", tags: ["评价", "评述"] },
    { startIdx: 104, endIdx: 111, title: "启示/认识/感悟类", subtitle: "思维拓展", icon: "💭", category: "高频进阶题型", tags: ["启示", "认识", "感悟"] },
    { startIdx: 112, endIdx: 119, title: "观点评析/辨析类", subtitle: "思辨能力", icon: "辩论", category: "高频进阶题型", tags: ["观点", "评析", "辨析"] },
    // 三、新高考特色题型
    { startIdx: 121, endIdx: 128, title: "史料实证类", subtitle: "新课标要求", icon: "📜", category: "新高考特色题型", tags: ["史料", "实证", "新高考"] },
    { startIdx: 129, endIdx: 140, title: "图表信息类", subtitle: "新课标要求", icon: "📊", category: "新高考特色题型", tags: ["图表", "地图", "漫画", "新高考"] },
    { startIdx: 141, endIdx: 145, title: "历史人物评价类", subtitle: "新课标要求", icon: "👤", category: "新高考特色题型", tags: ["人物评价", "新高考"] },
    // 四、历史小论文
    { startIdx: 147, endIdx: 159, title: "观点论证型", subtitle: "小论文题型", icon: "✍️", category: "历史小论文", tags: ["小论文", "观点论证"] },
    { startIdx: 160, endIdx: 169, title: "自拟论题型", subtitle: "小论文题型", icon: "✍️", category: "历史小论文", tags: ["小论文", "自拟论题"] },
    { startIdx: 170, endIdx: nodes.length - 1, title: "关系探讨型", subtitle: "小论文题型", icon: "✍️", category: "历史小论文", tags: ["小论文", "关系探讨"] },
  ];

  // Delete old template records
  await db.studyGuide.deleteMany({ where: { category: "答题模板" } });

  // Create individual template records
  for (const section of sections) {
    const sectionNodes = nodes.slice(section.startIdx, section.endIdx + 1);
    const content = { type: "doc", content: sectionNodes };

    await db.studyGuide.create({
      data: {
        title: section.title,
        category: section.category,
        content,
        tags: section.tags,
      },
    });
    console.log(`  Created: ${section.title} (${sectionNodes.length} nodes)`);
  }

  // Keep the 考试策略 guide
  const strategyGuide = await db.studyGuide.findFirst({ where: { category: "考试策略" } });
  if (!strategyGuide) {
    console.log("Warning: 考试策略 guide not found");
  }

  const count = await db.studyGuide.count();
  console.log(`\nDone! Total guides: ${count}`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
