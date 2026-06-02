// 中国视角历史路线数据

export interface ChinaRoute {
  id: string;
  name: string;
  event_id: string;
  path: [number, number][];        // polyline 坐标 [经度, 纬度]
  waypoints: {
    name: string;
    coords: [number, number];
    label?: string;                // 途经点副标题
  }[];
  color?: string;
}

export const chinaRoutes: ChinaRoute[] = [
  {
    id: "zhang-qian",
    name: "张骞出使西域",
    event_id: "zhang-qian",
    path: [
      [108.94, 34.26],  // 长安（今西安）
      [106.35, 34.58],  // 宝鸡附近
      [103.83, 36.06],  // 兰州
      [102.64, 37.93],  // 武威
      [100.45, 38.93],  // 张掖
      [98.51, 39.74],   // 酒泉
      [94.66, 40.14],   // 敦煌
      [93.51, 42.83],   // 哈密
      [89.18, 42.95],   // 吐鲁番
      [86.57, 42.06],   // 焉耆
      [82.96, 41.72],   // 库车
      [80.29, 41.17],   // 阿克苏
      [75.99, 39.47],   // 喀什
      [71.79, 40.50],   // 费尔干纳（大宛）
      [67.00, 36.70],   // 阿富汗北部（大月氏）
    ],
    waypoints: [
      { name: "长安", coords: [108.94, 34.26], label: "起点" },
      { name: "兰州", coords: [103.83, 36.06] },
      { name: "敦煌", coords: [94.66, 40.14] },
      { name: "哈密", coords: [93.51, 42.83] },
      { name: "吐鲁番", coords: [89.18, 42.95] },
      { name: "库车", coords: [82.96, 41.72] },
      { name: "喀什", coords: [75.99, 39.47] },
      { name: "大宛", coords: [71.79, 40.50], label: "费尔干纳" },
      { name: "大月氏", coords: [67.00, 36.70], label: "终点" },
    ],
    color: "#8B4513",
  },
];
