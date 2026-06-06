import { PrismaClient, QuestionType, SourceType } from "@prisma/client";

const db = new PrismaClient();

type RichDoc = {
  type: "doc";
  content: Array<{ type: "paragraph"; content: Array<{ type: "text"; text: string }> }>;
};

type ThemeSeed = {
  title: string;
  category: string;
  description: string;
  eraStart: string;
  eraEnd: string;
  sortOrder: number;
  sections: Array<{ title: string; points: string[]; keyTerms: string[] }>;
};

function doc(...paragraphs: string[]): RichDoc {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

function textFromRich(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const parts: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    if ("text" in node && typeof node.text === "string") {
      parts.push(node.text);
    }
    if ("content" in node && Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  }

  walk(value);
  return parts.join(" ");
}

function compactMindMap(title: string, lessonTitle: string) {
  return {
    name: title,
    children: [
      { name: "背景与条件", children: [{ name: `放回《${lessonTitle}》的时代背景理解` }] },
      { name: "核心内容", children: [{ name: "抓住人物、制度、事件、原因和影响" }] },
      { name: "历史影响", children: [{ name: "联系前后知识点，形成解释链条" }] },
      { name: "易错辨析", children: [{ name: "区分时间顺序、概念边界和因果层次" }] },
    ],
  };
}

function keyConcepts(title: string, lessonTitle: string, tags: string[]) {
  return [
    { term: title, explanation: `本知识点是《${lessonTitle}》中的核心内容，需要从背景、内容、影响三个层次掌握。` },
    { term: "时空定位", explanation: "先确认所处朝代、阶段或世界历史时期，再分析事件之间的先后关系。" },
    { term: "历史解释", explanation: "用原因、过程、结果、影响的链条组织答案，避免只背零散结论。" },
    ...tags.slice(0, 2).map((tag) => ({ term: tag, explanation: `与“${title}”密切相关的高频关键词。` })),
  ];
}

function commonMisconceptions(title: string) {
  return [
    `把“${title}”孤立记忆，忽略它与前后历史阶段的联系。`,
    "只记结论，不说明材料依据或历史背景。",
    "混淆相近制度、事件或概念的时间顺序和适用范围。",
  ];
}

function tokenize(text: string): string[] {
  const keywords = [
    "文明起源", "早期国家", "西周", "宗法", "分封", "礼乐", "商鞅", "变法", "百家争鸣", "法家",
    "秦", "中央集权", "郡县", "小篆", "汉", "大一统", "丝绸之路", "三国", "魏晋", "民族交融",
    "隋唐", "三省六部", "科举", "宋", "元", "行省", "明清", "军机处", "闭关锁国", "鸦片战争",
    "洋务", "甲午", "戊戌", "辛亥", "五四", "新文化", "中国共产党", "抗日", "解放战争", "新中国",
    "改革开放", "古希腊", "罗马", "中古", "新航路", "文艺复兴", "启蒙", "工业革命", "马克思",
    "巴黎公社", "十月革命", "冷战", "全球化", "联合国", "世界市场", "资本主义", "社会主义",
  ];
  const bag = new Set<string>();
  for (const keyword of keywords) {
    if (text.includes(keyword)) bag.add(keyword);
  }
  text
    .split(/[，。！？、；：\s"'“”‘’（）()《》—\-]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && part.length <= 12)
    .forEach((part) => bag.add(part));
  return [...bag];
}

function scoreQuestionToKp(questionText: string, questionTags: string[], kp: { title: string; tags: string[]; lesson: { title: string } }) {
  const text = `${questionText} ${questionTags.join(" ")}`;
  const tokens = tokenize(text);
  let score = 0;

  for (const token of tokens) {
    if (kp.title.includes(token) || token.includes(kp.title)) score += 8;
    if (kp.lesson.title.includes(token) || token.includes(kp.lesson.title)) score += 5;
    if (kp.tags.some((tag) => tag.includes(token) || token.includes(tag))) score += 3;
  }

  const manualGroups: Array<[RegExp, RegExp, number]> = [
    [/文明起源|古人类|早期国家|夏商周|西周|宗法|分封|礼乐/, /文明的起源|早期国家/, 15],
    [/商鞅|变法|百家争鸣|法家|诸侯/, /诸侯纷争|变法/, 15],
    [/秦|中央集权|郡县|小篆|官僚政治/, /秦统一|封建国家/, 15],
    [/汉|大一统|丝绸之路|武帝|董仲舒/, /西汉|东汉|大一统/, 15],
    [/三国|两晋|南北朝|民族交融|孝文帝/, /三国两晋南北朝|民族交融/, 15],
    [/隋唐|三省六部|科举|贞观|开元/, /隋唐|制度的变化与创新/, 15],
    [/宋|元|行省|理学|市舶|交子/, /两宋|辽宋夏金元|宋元/, 15],
    [/明清|军机处|内阁|闭关|海禁|郑和/, /明清/, 15],
    [/鸦片|太平天国|洋务|甲午|戊戌|辛亥/, /鸦片战争|国家出路|辛亥/, 15],
    [/五四|新文化|共产党|国共|抗日|解放战争/, /五四|中国共产党|抗日|解放战争/, 15],
    [/新中国|一五计划|三大改造|改革开放|外交/, /中华人民共和国|改革开放|新中国/, 15],
    [/古希腊|罗马|中古|西欧|新航路|文艺复兴|启蒙|工业革命/, /古代文明|中古|新航路|文艺复兴|工业革命/, 15],
    [/马克思|巴黎公社|十月革命|冷战|全球化|联合国/, /马克思|十月革命|冷战|全球化|国际组织/, 15],
  ];

  for (const [questionPattern, kpPattern, weight] of manualGroups) {
    if (questionPattern.test(text) && (kpPattern.test(kp.title) || kpPattern.test(kp.lesson.title))) {
      score += weight;
    }
  }

  return score;
}

async function backfillKnowledgePointDetails() {
  const points = await db.knowledgePoint.findMany({
    include: { lesson: { select: { title: true } } },
  });
  let updated = 0;

  for (const point of points) {
    const data: Record<string, unknown> = {};
    if (!point.mindMapJson) data.mindMapJson = compactMindMap(point.title, point.lesson.title);
    if (!point.keyConcepts) data.keyConcepts = keyConcepts(point.title, point.lesson.title, point.tags);
    if (!point.commonMisconceptions) data.commonMisconceptions = commonMisconceptions(point.title);

    if (Object.keys(data).length > 0) {
      await db.knowledgePoint.update({ where: { id: point.id }, data });
      updated += 1;
    }
  }

  return updated;
}

async function backfillQuestionLinks() {
  const [questions, points] = await Promise.all([
    db.question.findMany({
      include: { knowledgePointLinks: true },
    }),
    db.knowledgePoint.findMany({
      select: { id: true, title: true, tags: true, lesson: { select: { title: true } } },
    }),
  ]);

  let created = 0;

  for (const question of questions) {
    if (question.knowledgePointLinks.length > 0) continue;

    const questionText = textFromRich(question.stem);
    const ranked = points
      .map((point) => ({ point, score: scoreQuestionToKp(questionText, question.tags, point) }))
      .sort((a, b) => b.score - a.score);

    const selected = ranked.filter((item) => item.score >= 8).slice(0, 3);
    const fallback = selected.length > 0 ? selected : ranked.slice(0, 1);

    await db.knowledgePointOnQuestion.createMany({
      data: fallback.map(({ point }) => ({
        questionId: question.id,
        knowledgePointId: point.id,
      })),
      skipDuplicates: true,
    });
    created += fallback.length;
  }

  return created;
}

const themes: ThemeSeed[] = [
  {
    title: "中国古代政治制度演变",
    category: "CHINESE",
    description: "从分封宗法到君主专制中央集权，梳理中国古代国家治理结构的长期演进。",
    eraStart: "先秦",
    eraEnd: "明清",
    sortOrder: 1,
    sections: [
      {
        title: "早期国家与贵族政治",
        points: ["夏商周形成王位世袭、内外服、分封宗法等制度。", "政治秩序依靠血缘、等级和礼乐维系。", "地方诸侯具有较大独立性，中央权力尚未高度集中。"],
        keyTerms: ["王位世袭制", "分封制", "宗法制", "礼乐制度"],
      },
      {
        title: "秦汉中央集权的确立与巩固",
        points: ["秦朝建立皇帝制度、三公九卿制和郡县制。", "汉代通过推恩令、刺史制度和尊崇儒术巩固大一统。", "官僚政治逐步取代贵族政治。"],
        keyTerms: ["皇帝制度", "郡县制", "推恩令", "大一统"],
      },
      {
        title: "隋唐至宋元制度的发展",
        points: ["三省六部制分工制衡，提高行政效率。", "科举制扩大统治基础，推动社会阶层流动。", "元代行省制加强对辽阔疆域的治理。"],
        keyTerms: ["三省六部制", "科举制", "行省制"],
      },
      {
        title: "明清君主专制强化",
        points: ["明太祖废丞相，皇权进一步集中。", "内阁和军机处服务于皇权决策。", "边疆治理与多民族国家版图进一步巩固。"],
        keyTerms: ["废丞相", "内阁", "军机处", "改土归流"],
      },
    ],
  },
  {
    title: "近代中国救亡图存与民族复兴",
    category: "CHINESE",
    description: "围绕近代以来中国社会危机、道路探索和民族复兴，整合纲要上册关键内容。",
    eraStart: "1840年",
    eraEnd: "1949年",
    sortOrder: 2,
    sections: [
      {
        title: "民族危机不断加深",
        points: ["鸦片战争后中国逐步沦为半殖民地半封建社会。", "列强侵略与不平等条约破坏国家主权。", "甲午战争和八国联军侵华进一步加深危机。"],
        keyTerms: ["鸦片战争", "不平等条约", "甲午战争", "半殖民地半封建社会"],
      },
      {
        title: "不同阶层的道路探索",
        points: ["农民阶级、地主阶级洋务派、资产阶级维新派和革命派先后探索出路。", "辛亥革命推翻清王朝，但未完成反帝反封建任务。", "新文化运动推动思想解放。"],
        keyTerms: ["太平天国", "洋务运动", "戊戌变法", "辛亥革命", "新文化运动"],
      },
      {
        title: "中国共产党的成立与新民主主义革命",
        points: ["五四运动促进马克思主义传播和工人运动结合。", "中国共产党成立后，中国革命面貌焕然一新。", "抗日战争和人民解放战争推动民族独立和人民解放。"],
        keyTerms: ["五四运动", "中国共产党", "抗日战争", "解放战争"],
      },
    ],
  },
  {
    title: "世界市场形成与经济全球化",
    category: "WORLD",
    description: "从新航路开辟到工业革命，再到二战后全球化，理解世界联系增强的历史进程。",
    eraStart: "15世纪",
    eraEnd: "当代",
    sortOrder: 3,
    sections: [
      {
        title: "新航路开辟与早期殖民扩张",
        points: ["新航路开辟打破相对隔绝状态，世界开始连成整体。", "殖民扩张和三角贸易推动资本原始积累。", "全球物种、人口和文化交流加速。"],
        keyTerms: ["新航路开辟", "殖民扩张", "三角贸易"],
      },
      {
        title: "工业革命与世界市场",
        points: ["工业革命提升生产力，推动商品输出和原料需求。", "资本主义世界市场基本形成。", "世界分工和不平等国际经济秩序加深。"],
        keyTerms: ["工业革命", "世界市场", "资本主义"],
      },
      {
        title: "战后国际经济秩序与全球化",
        points: ["布雷顿森林体系和关贸总协定推动经济制度化。", "区域集团化与经济全球化并行发展。", "发展中国家面临机遇与挑战。"],
        keyTerms: ["布雷顿森林体系", "关贸总协定", "经济全球化", "区域集团化"],
      },
    ],
  },
  {
    title: "中外政治制度比较",
    category: "COMPARISON",
    description: "比较中国古代中央集权、近代西方民主政治与现代国家治理模式的差异。",
    eraStart: "古代",
    eraEnd: "现代",
    sortOrder: 4,
    sections: [
      {
        title: "中国古代中央集权模式",
        points: ["以皇权为核心，强调中央对地方的垂直管理。", "制度演进体现皇权加强和地方权力削弱趋势。", "适应统一多民族国家治理需要。"],
        keyTerms: ["皇权", "中央集权", "郡县制", "行省制"],
      },
      {
        title: "近代西方民主政治",
        points: ["资产阶级革命推动代议制、分权制衡和法治原则形成。", "不同国家形成君主立宪制、共和制等多样模式。", "民主政治发展具有渐进性和曲折性。"],
        keyTerms: ["代议制", "分权制衡", "君主立宪制", "共和制"],
      },
      {
        title: "比较视角与答题方法",
        points: ["比较制度要从经济基础、阶级关系、思想文化和历史传统入手。", "既要看到制度差异，也要说明各自适应的历史条件。", "避免用单一现代标准简单评判古代制度。"],
        keyTerms: ["比较史观", "历史条件", "制度适应性"],
      },
    ],
  },
];

async function upsertTheme(seed: ThemeSeed) {
  const existing = await db.theme.findFirst({ where: { title: seed.title } });
  const data = {
    title: seed.title,
    category: seed.category,
    description: seed.description,
    eraStart: seed.eraStart,
    eraEnd: seed.eraEnd,
    sortOrder: seed.sortOrder,
  };
  const theme = existing
    ? await db.theme.update({ where: { id: existing.id }, data })
    : await db.theme.create({ data });

  await db.themeSection.deleteMany({ where: { themeId: theme.id } });
  await db.themeSection.createMany({
    data: seed.sections.map((section, index) => ({
      themeId: theme.id,
      title: section.title,
      sortOrder: index + 1,
      content: { points: section.points, keyTerms: section.keyTerms },
    })),
  });
}

async function upsertByTitle<T extends { title: string }>(
  model: {
    findFirst(args: { where: { title: string } }): Promise<{ id: string } | null>;
    update(args: { where: { id: string }; data: T }): Promise<unknown>;
    create(args: { data: T }): Promise<unknown>;
  },
  data: T,
) {
  const existing = await model.findFirst({ where: { title: data.title } });
  if (existing) return model.update({ where: { id: existing.id }, data });
  return model.create({ data });
}

async function seedThemes() {
  for (const theme of themes) await upsertTheme(theme);
  return themes.length;
}

async function seedSources() {
  const importantKps = await db.knowledgePoint.findMany({ take: 12, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } });
  const kpIds = importantKps.map((kp) => kp.id);

  const sources = [
    {
      title: "《史记·秦始皇本纪》节选：秦统一与制度建设",
      type: SourceType.DOCUMENT,
      era: "秦朝",
      dynasty: "秦",
      origin: "司马迁《史记》",
      description: "用于理解秦统一后皇帝制度、郡县制和统一措施的文献材料。",
      content: {
        original: "分天下以为三十六郡，郡置守、尉、监。",
        translation: "秦朝把全国划分为郡，在郡设置行政、军事和监察官员。",
        questions: ["材料反映秦朝地方治理发生了什么变化？", "郡县制与分封制的主要差异是什么？"],
      },
      imageUrls: [],
      analysisGuidance: "抓关键词“郡”“守、尉、监”，联系中央集权和官僚政治。",
      citationInfo: "《史记·秦始皇本纪》",
      knowledgePointIds: kpIds.slice(0, 4),
      tags: ["秦朝", "郡县制", "中央集权", "史料实证"],
    },
    {
      title: "《南京条约》主要条款摘录",
      type: SourceType.DOCUMENT,
      era: "近代中国",
      dynasty: "清",
      origin: "中英《南京条约》",
      description: "认识鸦片战争后中国主权受损和社会性质变化的重要材料。",
      content: {
        original: "开放广州、厦门、福州、宁波、上海五处为通商口岸。",
        translation: "清政府被迫开放五个通商口岸，便利英国商品输入。",
        questions: ["通商口岸开放对中国经济和主权有何影响？", "为什么说《南京条约》是中国近代史开端的重要标志？"],
      },
      imageUrls: [],
      analysisGuidance: "从领土、关税、司法、贸易等角度分析不平等条约的影响。",
      citationInfo: "1842年《南京条约》",
      knowledgePointIds: kpIds,
      tags: ["鸦片战争", "不平等条约", "近代中国"],
    },
    {
      title: "新航路开辟路线示意材料",
      type: SourceType.MAP,
      era: "近代早期",
      dynasty: null,
      origin: "教材地图整理",
      description: "用于分析新航路开辟的方向、动因和世界影响。",
      content: {
        routes: ["迪亚士到达好望角", "达·伽马到达印度", "哥伦布到达美洲", "麦哲伦船队完成环球航行"],
        questions: ["新航路开辟如何改变世界联系？", "欧洲殖民扩张与世界市场形成有什么关系？"],
      },
      imageUrls: [],
      analysisGuidance: "把地图路线与商品流动、殖民扩张、世界市场联系起来。",
      citationInfo: "依据高中历史教材地图整理",
      knowledgePointIds: [],
      tags: ["新航路开辟", "世界市场", "地图史料"],
    },
    {
      title: "一五计划时期工业建设数据表",
      type: SourceType.DATA_CHART,
      era: "新中国",
      dynasty: null,
      origin: "教材数据整理",
      description: "通过数据理解新中国工业化起步和社会主义建设探索。",
      content: {
        rows: [
          { item: "重工业", trend: "快速增长" },
          { item: "交通运输", trend: "基础设施改善" },
          { item: "工业布局", trend: "东北等地区重点建设" },
        ],
        questions: ["一五计划为什么优先发展重工业？", "数据变化反映了怎样的国家建设目标？"],
      },
      imageUrls: [],
      analysisGuidance: "数据题要先看项目和趋势，再联系时代背景与国家战略。",
      citationInfo: "依据教材统计资料整理",
      knowledgePointIds: [],
      tags: ["一五计划", "工业化", "数据史料"],
    },
  ];

  for (const source of sources) {
    await upsertByTitle(db.sourceMaterial, source);
  }
  return sources.length;
}

async function seedHistoricalMaps() {
  const maps = [
    {
      title: "秦朝统一与郡县制布局",
      description: "展示秦统一后的主要疆域、都城咸阳和郡县制治理空间。",
      era: "秦朝",
      startYear: -221,
      endYear: -206,
      centerLat: 34.3,
      centerLng: 108.9,
      defaultZoom: 5,
      baseLayerJson: { provider: "tianditu", view: "china" },
      overlayJson: {
        markers: [
          { name: "咸阳", lat: 34.33, lng: 108.7, type: "capital" },
          { name: "岭南地区", lat: 23.1, lng: 113.3, type: "frontier" },
        ],
      },
      annotations: { summary: "秦朝通过郡县制把地方纳入中央直接管理。" },
      eventsJson: [{ year: -221, title: "秦统一六国" }, { year: -214, title: "开拓岭南" }],
    },
    {
      title: "丝绸之路与汉代中外交流",
      description: "展示长安至西域、中亚的交流路线，理解汉代对外关系。",
      era: "汉朝",
      startYear: -138,
      endYear: 220,
      centerLat: 38,
      centerLng: 92,
      defaultZoom: 4,
      baseLayerJson: { provider: "tianditu", view: "eurasia" },
      overlayJson: {
        routes: [{ name: "陆上丝绸之路", points: [[34.26, 108.95], [40.14, 94.66], [41.26, 69.22]] }],
      },
      annotations: { summary: "丝绸之路促进东西方经济文化交流。" },
      eventsJson: [{ year: -138, title: "张骞第一次出使西域" }],
    },
    {
      title: "鸦片战争后通商口岸分布",
      description: "展示五口通商格局，理解近代中国被迫开放的空间变化。",
      era: "近代中国",
      startYear: 1842,
      endYear: 1860,
      centerLat: 29,
      centerLng: 116,
      defaultZoom: 5,
      baseLayerJson: { provider: "tianditu", view: "china" },
      overlayJson: {
        markers: ["广州", "厦门", "福州", "宁波", "上海"].map((name) => ({ name, type: "treaty_port" })),
      },
      annotations: { summary: "通商口岸开放反映中国主权和经济结构受到冲击。" },
      eventsJson: [{ year: 1842, title: "《南京条约》签订" }],
    },
  ];

  for (const map of maps) {
    await upsertByTitle(db.historicalMap, map);
  }
  return maps.length;
}

async function seedGuidesAndFrameworks() {
  const guides = [
    {
      title: "材料题三步法：读材料、找信息、扣设问",
      category: "史料实证类",
      description: "训练学生从材料出发组织答案，减少脱离材料背书。",
      content: doc(
        "第一步：读设问。先圈出限定词、中心词和作答方向，判断题目问原因、特点、影响还是认识。",
        "第二步：读材料。按句子划分层次，标出时间、主体、行为、结果等有效信息。",
        "第三步：组织答案。材料信息在前，教材知识补充在后，用序号分点表达。"
      ),
      tags: ["材料题", "史料实证", "答题方法"],
    },
    {
      title: "时间轴复习法：用阶段特征串联知识",
      category: "记忆方法",
      description: "把零散历史事件放入阶段特征中理解。",
      content: doc(
        "复习时先确定时代阶段，如先秦、秦汉、隋唐、明清、近代前期、现代中国等。",
        "每个阶段至少整理政治、经济、思想文化、民族关系和对外关系五条线索。",
        "遇到新题时，先把题目放回阶段，再调用对应阶段的特征。"
      ),
      tags: ["时空观念", "复习方法", "阶段特征"],
    },
    {
      title: "论述题结构：观点、史实、论证、升华",
      category: "历史小论文",
      description: "适合开放性论述题和观点评析题。",
      content: doc(
        "观点要明确，最好用一句完整判断句表达。",
        "史实要准确，至少选择两个不同时段或不同角度的史实支撑。",
        "论证要说明史实如何证明观点，不能只罗列事件。",
        "结尾可从历史规律、现实启示或学科素养角度简要升华。"
      ),
      tags: ["论述题", "历史解释", "高考"],
    },
  ];

  const frameworks = [
    {
      title: "原因背景类答题框架",
      questionType: "原因/背景/条件",
      structureJson: {
        steps: ["审清主体与时间", "分政治、经济、思想、社会、国际等角度", "区分根本原因、直接原因和主客观原因"],
      },
      exampleJson: {
        question: "分析鸦片战争爆发的原因。",
        answer: ["根本原因：英国完成工业革命，需要市场和原料。", "直接原因：虎门销烟成为英国发动战争的借口。", "清政府方面：闭关锁国、政治腐败、军备落后。"],
      },
      tips: ["不要只写“落后挨打”。", "原因要服务于题目限定对象。"],
    },
    {
      title: "影响意义类答题框架",
      questionType: "影响/意义/作用",
      structureJson: {
        steps: ["判断积极或消极影响", "分国内和国际、短期和长期角度", "联系时代发展趋势"],
      },
      exampleJson: {
        question: "说明新航路开辟的影响。",
        answer: ["世界开始连成整体。", "促进欧洲资本主义发展。", "带来殖民扩张和殖民灾难。"],
      },
      tips: ["影响类答案要分层。", "同一事件可能同时有积极和消极影响。"],
    },
    {
      title: "比较类答题框架",
      questionType: "比较/对比",
      structureJson: {
        steps: ["明确比较对象", "确定比较维度", "先同后异或先异后同", "解释差异原因"],
      },
      exampleJson: {
        question: "比较中国古代中央集权与近代西方代议制。",
        answer: ["权力结构不同。", "经济基础和阶级关系不同。", "制度形成的历史传统不同。"],
      },
      tips: ["不能只列一个对象。", "比较要有共同维度。"],
    },
  ];

  for (const guide of guides) {
    await upsertByTitle(db.studyGuide, guide);
  }
  for (const framework of frameworks) {
    await upsertByTitle(db.essayFramework, framework);
  }
  return { guides: guides.length, frameworks: frameworks.length };
}

async function seedLearningResources() {
  const points = await db.knowledgePoint.findMany({ take: 8, select: { id: true, title: true } });
  const kpIds = points.map((point) => point.id);

  const lectures = [
    {
      title: "10分钟理解中央集权制度",
      description: "用制度演变线索讲清皇权、中央与地方关系。",
      videoUrl: null,
      audioUrl: null,
      duration: 600,
      thumbnailUrl: null,
      knowledgePointIds: kpIds.slice(0, 4),
      transcript: "从分封制到郡县制，再到行省制和军机处，观察中国古代政治制度演进的主线。",
    },
    {
      title: "近代中国救亡图存线索梳理",
      description: "串联鸦片战争、洋务运动、戊戌变法、辛亥革命和五四运动。",
      videoUrl: null,
      audioUrl: null,
      duration: 720,
      thumbnailUrl: null,
      knowledgePointIds: kpIds,
      transcript: "近代中国探索具有阶层递进和道路转换的特点，最终走向新民主主义革命道路。",
    },
  ];

  const readings = [
    {
      title: "从郡县制到行省制：统一多民族国家的治理逻辑",
      author: "InSightory 教研组",
      content: doc(
        "中国古代地方治理制度的变化，反映中央权力与地方治理效率之间的长期调适。",
        "郡县制强化中央直接管理，行省制则适应更辽阔疆域的治理需要。"
      ),
      source: "平台原创拓展阅读",
      knowledgePointIds: kpIds.slice(0, 4),
      readingTime: 8,
      coverImage: null,
    },
    {
      title: "世界市场：从地理发现到全球化",
      author: "InSightory 教研组",
      content: doc(
        "世界市场不是一日形成的，它经历了新航路开辟、殖民扩张、工业革命和战后制度化等阶段。",
        "理解世界市场，要同时看到联系增强和不平等扩大的双重面向。"
      ),
      source: "平台原创拓展阅读",
      knowledgePointIds: [],
      readingTime: 10,
      coverImage: null,
    },
  ];

  const recommendations = [
    {
      title: "中国历史地图集学习路径",
      type: "map",
      description: "按朝代查看疆域、都城、交通路线和战争路线。",
      coverImage: null,
      link: "/atlas",
      rating: 4.8,
      tags: ["地图", "时空观念"],
    },
    {
      title: "高考历史材料题训练清单",
      type: "practice",
      description: "围绕材料解读、概括特点、分析原因、评价影响进行训练。",
      coverImage: null,
      link: "/guides",
      rating: 4.7,
      tags: ["高考", "材料题"],
    },
    {
      title: "专题史贯通复习入口",
      type: "theme",
      description: "用专题方式打通教材章节之间的联系。",
      coverImage: null,
      link: "/themes",
      rating: 4.9,
      tags: ["专题史", "复习"],
    },
  ];

  for (const lecture of lectures) await upsertByTitle(db.microLecture, lecture);
  for (const reading of readings) await upsertByTitle(db.extendedReading, reading);
  for (const recommendation of recommendations) await upsertByTitle(db.resourceRecommendation, recommendation);
  return { lectures: lectures.length, readings: readings.length, recommendations: recommendations.length };
}

async function seedExamPapers() {
  const questions = await db.question.findMany({
    where: { isPublished: true, type: { in: [QuestionType.MC, QuestionType.TRUE_FALSE, QuestionType.MULTI_SELECT] } },
    include: { knowledgePointLinks: true },
    take: 20,
    orderBy: { createdAt: "asc" },
  });
  if (questions.length === 0) return { papers: 0, paperQuestions: 0 };

  const admin = await db.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
  const knowledgePointIds = [...new Set(questions.flatMap((question) => question.knowledgePointLinks.map((link) => link.knowledgePointId)))];
  const existing = await db.examPaper.findFirst({ where: { title: "高中历史同步练习卷（一）" } });
  const paperData = {
    title: "高中历史同步练习卷（一）",
    type: "同步练习",
    description: "覆盖基础知识、易错判断和核心概念辨析的入门练习卷。",
    totalScore: questions.length * 5,
    timeLimit: 45,
    questionIds: questions.map((question) => question.id),
    knowledgePointIds,
    difficulty: 1,
    createdById: admin?.id,
    isPublished: true,
  };
  const paper = existing
    ? await db.examPaper.update({ where: { id: existing.id }, data: paperData })
    : await db.examPaper.create({ data: paperData });

  await db.examPaperQuestion.deleteMany({ where: { examPaperId: paper.id } });
  await db.examPaperQuestion.createMany({
    data: questions.map((question, index) => ({
      examPaperId: paper.id,
      questionId: question.id,
      sortOrder: index + 1,
      score: 5,
    })),
  });

  return { papers: 1, paperQuestions: questions.length };
}

async function main() {
  console.log("Backfilling InSightory content gaps...");

  const kpUpdated = await backfillKnowledgePointDetails();
  const questionLinks = await backfillQuestionLinks();
  const themeCount = await seedThemes();
  const sourceCount = await seedSources();
  const mapCount = await seedHistoricalMaps();
  const guideCounts = await seedGuidesAndFrameworks();
  const resourceCounts = await seedLearningResources();
  const paperCounts = await seedExamPapers();

  console.log("Backfill complete:");
  console.log(`  Knowledge points enriched: ${kpUpdated}`);
  console.log(`  Question links created: ${questionLinks}`);
  console.log(`  Themes upserted: ${themeCount}`);
  console.log(`  Source materials upserted: ${sourceCount}`);
  console.log(`  Historical maps upserted: ${mapCount}`);
  console.log(`  Study guides upserted: ${guideCounts.guides}`);
  console.log(`  Essay frameworks upserted: ${guideCounts.frameworks}`);
  console.log(`  Micro lectures upserted: ${resourceCounts.lectures}`);
  console.log(`  Extended readings upserted: ${resourceCounts.readings}`);
  console.log(`  Resource recommendations upserted: ${resourceCounts.recommendations}`);
  console.log(`  Exam papers upserted: ${paperCounts.papers}`);
  console.log(`  Exam paper questions created: ${paperCounts.paperQuestions}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
