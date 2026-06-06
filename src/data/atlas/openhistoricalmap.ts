export type OpenHistoricalMapSample = {
  id: string;
  title: string;
  description: string;
  coords: [number, number];
  startYear: number;
  endYear: number;
  sourceUrl: string;
};

export const openHistoricalMapSamples: OpenHistoricalMapSample[] = [
  {
    id: "ohm-silk-road-changan",
    title: "丝绸之路：长安节点候选",
    description: "OHM 覆盖层候选点，适合与张骞通西域、丝绸之路知识点关联。",
    coords: [108.94, 34.34],
    startYear: -138,
    endYear: 900,
    sourceUrl: "https://www.openhistoricalmap.org/",
  },
  {
    id: "ohm-columbus-route",
    title: "新航路：大西洋航线候选",
    description: "OHM 可补充历史航路、港口和到达地点，需人工校对后入库。",
    coords: [-25, 25],
    startYear: 1492,
    endYear: 1600,
    sourceUrl: "https://www.openhistoricalmap.org/",
  },
  {
    id: "ohm-colonial-empire",
    title: "殖民扩张：历史边界候选",
    description: "用于提示世界殖民体系形成相关地图对象，不替代项目自有教材图层。",
    coords: [0, 15],
    startYear: 1600,
    endYear: 1914,
    sourceUrl: "https://www.openhistoricalmap.org/",
  },
];
