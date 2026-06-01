// 新航路开辟探险航线数据

export interface ExplorationRoute {
  id: string;
  name: string;
  explorer: string;
  start_year: number;
  end_year: number;
  routes: { type: "maritime"; path: [number, number][] }[];
  nodes: { name: string; coords: [number, number] }[];
  detail: {
    title: string;
    description: string;
    source: string;
  };
  event_id?: string;
}

export const explorationRoutes: ExplorationRoute[] = [
  // ─── 哥伦布发现新大陆 ───────────────────────────
  {
    id: "columbus",
    name: "哥伦布发现新大陆",
    explorer: "哥伦布",
    start_year: 1492,
    end_year: 1492,
    routes: [
      {
        type: "maritime",
        path: [
          [-4.0, 37.0],
          [-15.0, 28.0],
          [-30.0, 22.0],
          [-45.0, 18.0],
          [-60.0, 18.0],
          [-70.0, 20.0],
        ],
      },
    ],
    nodes: [
      { name: "帕洛斯(西班牙)", coords: [-4.0, 37.0] },
      { name: "巴哈马群岛", coords: [-70.0, 20.0] },
    ],
    detail: {
      title: "哥伦布发现新大陆",
      description: "## 哥伦布发现新大陆\n\n**时间**: 1492年\n\n**历史背景**\n\n15世纪末,欧洲商品经济发展,对黄金和香料的需求日益增长。传统的东西方商路被奥斯曼帝国控制,欧洲人迫切需要开辟通往东方的新航路。\n\n**详细经过**\n\n1492年8月3日,热那亚航海家哥伦布率领87名船员,乘坐三艘帆船从西班牙帕洛斯港出发,向西横渡大西洋。经过两个多月的航行,10月12日到达巴哈马群岛中的圣萨尔瓦多岛,随后到达古巴、海地等岛屿。\n\n哥伦布始终认为自己到达的是印度,称当地居民为印第安人。此后他又三次横渡大西洋,到达中美洲和南美洲的一些地区。\n\n**影响**\n\n哥伦布发现新大陆打破了美洲与世隔绝的状态,开启了欧洲对美洲的殖民掠夺,引发了地理大发现的浪潮。大量黄金白银流入欧洲,加速了资本原始积累,促进了欧洲资本主义的发展。但同时也给美洲原住民带来了深重灾难。\n\n**教材出处**: 中外历史纲要(下)第7课",
      source: "中外历史纲要(下)第7课",
    },
    event_id: "age-of-exploration",
  },
  // ─── 迪亚士到达好望角 ───────────────────────────
  {
    id: "dias",
    name: "迪亚士到达好望角",
    explorer: "迪亚士",
    start_year: 1487,
    end_year: 1488,
    routes: [
      {
        type: "maritime",
        path: [
          [-9.0, 38.7],
          [-5.0, 30.0],
          [-10.0, 15.0],
          [10.0, -5.0],
          [15.0, -15.0],
          [18.0, -33.0],
        ],
      },
    ],
    nodes: [
      { name: "里斯本(葡萄牙)", coords: [-9.0, 38.7] },
      { name: "好望角", coords: [18.0, -33.0] },
    ],
    detail: {
      title: "迪亚士到达好望角",
      description: `## 迪亚士到达好望角

**时间**: 1487年-1488年

**历史背景**

15世纪后期,葡萄牙积极进行航海探险,试图开辟绕过非洲到达东方的海上航线。葡萄牙国王若昂二世派遣巴托洛梅乌迪亚士率船队沿非洲西海岸南下,寻找通往印度的航路。

**详细经过**

1487年8月,迪亚士率领三艘帆船从葡萄牙里斯本出发,沿非洲西海岸南下。船队在纳米比亚海岸遭遇猛烈风暴,被吹离海岸。风暴持续了13天,当风暴平息后,迪亚士决定不再沿岸航行,而是直接向东航行,然后再向北转。

1488年2月3日,船队在远离海岸的地方发现了陆地。绕过这个海角后,迪亚士发现非洲东海岸的海岸线开始向东北方向延伸,他意识到自己已经绕过了非洲最南端。返航途中,迪亚士给这个海角取名为"风暴角"。葡萄牙国王若昂二世后来将其改名为"好望角",寓意绕过此处便有到达东方的希望。

**影响**

迪亚士到达好望角是欧洲航海史上的重大突破,证明了绕过非洲到达东方的航线是可行的。这为后来达伽马开辟通往印度的航线奠定了基础,也标志着葡萄牙在东方贸易竞争中取得了先机。

**教材出处**: 中外历史纲要(下)第7课`,
      source: "中外历史纲要(下)第7课",
    },
    event_id: "age-of-exploration",
  },
  // ─── 达伽马到达印度 ─────────────────────────────
  {
    id: "vasco-da-gama",
    name: "达伽马到达印度",
    explorer: "达伽马",
    start_year: 1497,
    end_year: 1499,
    routes: [
      {
        type: "maritime",
        path: [
          [-9.0, 38.7],
          [-5.0, 30.0],
          [-10.0, 15.0],
          [10.0, -5.0],
          [15.0, -15.0],
          [18.0, -33.0],
          [35.0, -30.0],
          [40.0, -15.0],
          [50.0, 10.0],
          [72.0, 15.0],
        ],
      },
    ],
    nodes: [
      { name: "里斯本(葡萄牙)", coords: [-9.0, 38.7] },
      { name: "好望角", coords: [18.0, -33.0] },
      { name: "卡利卡特(印度)", coords: [72.0, 15.0] },
    ],
    detail: {
      title: "达伽马到达印度",
      description: "## 达伽马到达印度\n\n**时间**: 1497年-1499年\n\n**历史背景**\n\n葡萄牙是欧洲最早开展航海探险的国家。在迪亚士于1488年到达好望角之后,葡萄牙王室决定派遣达伽马继续向东航行,寻找通往印度的海上航路。\n\n**详细经过**\n\n1497年7月,达伽马率领四艘帆船从葡萄牙里斯本出发,沿非洲西海岸南下。他采用了比迪亚士更远的弧形航线绕过好望角,沿非洲东海岸北上至莫桑比克和蒙巴萨。在马林迪,达伽马获得了一位经验丰富的阿拉伯领航员的帮助。\n\n1498年5月,船队到达印度西南海岸的卡利卡特,成功开辟了从欧洲绕道非洲到达印度的海上航线。达伽马用玻璃珠等廉价物品换取了大量香料和宝石,于1499年返回葡萄牙。\n\n**影响**\n\n达伽马开辟了欧洲通往东方的新航路,打破了阿拉伯商人对东方贸易的垄断,使葡萄牙成为第一个建立海上贸易帝国的欧洲国家。\n\n**教材出处**: 中外历史纲要(下)第7课",
      source: "中外历史纲要(下)第7课",
    },
    event_id: "age-of-exploration",
  },
  // ─── 麦哲伦环球航行 ─────────────────────────────
  {
    id: "magellan",
    name: "麦哲伦环球航行",
    explorer: "麦哲伦",
    start_year: 1519,
    end_year: 1522,
    routes: [
      // 大西洋 → 太平洋（跨越180°经线前）
      {
        type: "maritime",
        path: [
          [-6.0, 37.0],
          [-15.0, 25.0],
          [-30.0, 10.0],
          [-45.0, -10.0],
          [-55.0, -25.0],
          [-68.0, -40.0],
          [-75.0, -45.0],
          [-90.0, -30.0],
          [-120.0, -10.0],
          [-150.0, 0.0],
        ],
      },
      // 太平洋 → 印度洋（跨越180°经线后）
      {
        type: "maritime",
        path: [
          [120.0, 10.0],
          [110.0, -5.0],
          [80.0, -10.0],
          [50.0, -20.0],
          [30.0, -32.0],
          [0.0, 30.0],
          [-6.0, 37.0],
        ],
      },
    ],
    nodes: [
      { name: "塞维利亚(西班牙)", coords: [-6.0, 37.0] },
      { name: "麦哲伦海峡", coords: [-68.0, -40.0] },
      { name: "菲律宾", coords: [120.0, 10.0] },
      { name: "摩鹿加群岛", coords: [110.0, -5.0] },
    ],
    detail: {
      title: "麦哲伦环球航行",
      description: "## 麦哲伦环球航行\n\n**时间**: 1519年-1522年\n\n**历史背景**\n\n哥伦布发现新大陆后,欧洲人对美洲的认识仍不明确。西班牙王室支持葡萄牙航海家麦哲伦的西行计划,希望通过西行到达东方的香料群岛。\n\n**详细经过**\n\n1519年9月,麦哲伦率领五艘船、约270名船员从西班牙出发,沿南美洲东海岸南下。1520年10月,船队发现了连接大西洋和太平洋的海峡。穿越海峡后,船队进入浩瀚的太平洋。\n\n1521年3月,船队到达菲律宾群岛。麦哲伦在当地的部落冲突中被杀。剩余的船员在当地向导的帮助下继续航行,到达摩鹿加群岛,装满香料后取道印度洋绕过好望角返回西班牙。1522年9月,仅一艘船和18名船员回到西班牙,完成了人类历史上第一次环球航行。\n\n**影响**\n\n麦哲伦船队的环球航行用实践证明了地球是圆的,极大地拓展了人类对地球的认识。它开辟了新的全球航线,推动了世界市场的初步形成。\n\n**教材出处**: 中外历史纲要(下)第7课",
      source: "中外历史纲要(下)第7课",
    },
    event_id: "age-of-exploration",
  },
];

// 时间轴标记点(世界视角)
export const worldKeyEvents = [
  { year: 1453, label: "君士坦丁堡陷落", event_id: "ottoman-conquest" },
  { year: 1487, label: "迪亚士到达好望角", event_id: "dias" },
  { year: 1492, label: "哥伦布发现新大陆", event_id: "columbus" },
  { year: 1497, label: "达伽马到达印度", event_id: "vasco-da-gama" },
  { year: 1519, label: "麦哲伦环球航行", event_id: "magellan" },
  { year: 1500, label: "三角贸易", event_id: "triangle-trade" },
  { year: 1517, label: "宗教改革", event_id: "reformation" },
  { year: 1588, label: "英西海战", event_id: "spanish-armada" },
  { year: 1640, label: "英国革命", event_id: "english-revolution" },
  { year: 1648, label: "威斯特伐利亚和约", event_id: "westphalia" },
  { year: 1685, label: "启蒙运动", event_id: "enlightenment" },
  { year: 1760, label: "工业革命", event_id: "industrial-revolution" },
  { year: 1775, label: "美国独立", event_id: "american-revolution" },
  { year: 1789, label: "法国大革命", event_id: "french-revolution" },
  { year: 1804, label: "拿破仑称帝", event_id: "napoleon" },
  { year: 1848, label: "马克思主义诞生", event_id: "marxism" },
  { year: 1861, label: "俄国农奴制改革", event_id: "russian-empire-expansion" },
  { year: 1868, label: "明治维新", event_id: "meiji-restoration" },
  { year: 1871, label: "巴黎公社", event_id: "paris-commune" },
  { year: 1914, label: "一战", event_id: "wwi" },
  { year: 1917, label: "十月革命", event_id: "russian-revolution" },
  { year: 1929, label: "经济大危机", event_id: "great-depression" },
  { year: 1939, label: "二战", event_id: "wwii" },
  { year: 1947, label: "冷战", event_id: "cold-war" },
  { year: 1991, label: "苏联解体", event_id: "soviet-collapse" },
];
