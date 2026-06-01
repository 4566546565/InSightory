// 贸易网络数据

export interface TradeRoute {
  type: "overland" | "maritime";
  path: [number, number][];
}

export interface TradeNetwork {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  routes: TradeRoute[];
  nodes: { name: string; coords: [number, number] }[];
  detail: {
    title: string;
    description: string;
    source: string;
  };
  event_id?: string;
}

export const tradeNetworks: TradeNetwork[] = [
  {
    id: "triangle-trade",
    name: "三角贸易",
    start_year: 1500,
    end_year: 1900,
    routes: [
      // 出程：欧洲 → 非洲（运送枪支、纺织品等工业品）
      {
        type: "maritime",
        path: [
          [-3.0, 53.4],   // 利物浦（英国）
          [-9.0, 38.7],   // 里斯本附近
          [-15.0, 25.0],  // 加那利群岛
          [-10.0, 10.0],  // 西非沿海南下
          [5.0, 5.0],     // 几内亚湾
          [10.0, 5.0],    // 几内亚湾东端
        ],
      },
      // 中程：非洲 → 美洲（运送黑奴）
      {
        type: "maritime",
        path: [
          [10.0, 5.0],    // 几内亚湾
          [-5.0, 3.0],    // 大西洋
          [-20.0, 5.0],   // 大西洋中部
          [-35.0, 10.0],  // 大西洋
          [-50.0, 15.0],  // 接近美洲
          [-60.0, 18.0],  // 加勒比海
        ],
      },
      // 归程：美洲 → 欧洲（运送糖、烟草、棉花等原料）
      {
        type: "maritime",
        path: [
          [-60.0, 18.0],  // 加勒比海
          [-50.0, 28.0],  // 北大西洋
          [-35.0, 40.0],  // 亚速尔群岛附近
          [-15.0, 48.0],  // 欧洲沿海
          [-3.0, 53.4],   // 回到利物浦
        ],
      },
    ],
    nodes: [
      { name: "利物浦（英国）", coords: [-3.0, 53.4] },
      { name: "几内亚湾（西非）", coords: [10.0, 5.0] },
      { name: "加勒比海", coords: [-60.0, 18.0] },
    ],
    detail: {
      title: "三角贸易",
      description: "## 三角贸易\n\n**时间**：16世纪—19世纪\n\n**路线**：欧洲→非洲→美洲→欧洲\n\n**背景**：新航路开辟后，欧洲殖民者在美洲建立种植园，需要大量劳动力。非洲黑人被贩卖为奴隶，成为种植园的主要劳动力来源。\n\n**经过**：\n- 出程：欧洲殖民者将枪支、纺织品等工业品运往非洲\n- 中程：在非洲掳获黑人，横渡大西洋运往美洲贩卖\n- 归程：将美洲的糖、烟草、棉花等原料运回欧洲\n\n**影响**：三角贸易持续约400年，使非洲丧失上亿精壮人口，造成非洲长期贫困落后。欧洲殖民者获得巨额利润，加速了资本原始积累，促进了欧洲资本主义发展。\n\n**教材出处**：中外历史纲要（下）第9课",
      source: "中外历史纲要（下）第9课",
    },
    event_id: "triangle-trade",
  },
];
