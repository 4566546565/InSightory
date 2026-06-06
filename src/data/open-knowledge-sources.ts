import {
  Database,
  FileSearch,
  GitBranch,
  Globe2,
  GraduationCap,
  Map,
  Network,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type KnowledgeSourceUseCase =
  | "knowledge-point"
  | "historical-map"
  | "timeline"
  | "source-material"
  | "ingestion-pipeline"
  | "knowledge-graph";

export type KnowledgeSourceStatus = "ready" | "review" | "pipeline";

export type OpenKnowledgeSource = {
  id: string;
  name: string;
  shortName: string;
  summary: string;
  bestFor: string;
  url: string;
  license: string;
  status: KnowledgeSourceStatus;
  priority: number;
  useCases: KnowledgeSourceUseCase[];
  strengths: string[];
  cautions: string[];
  integration: string;
  icon: LucideIcon;
};

export const useCaseLabels: Record<KnowledgeSourceUseCase, string> = {
  "knowledge-point": "知识点扩充",
  "historical-map": "历史地图",
  timeline: "时间轴",
  "source-material": "史料资源",
  "ingestion-pipeline": "导入流水线",
  "knowledge-graph": "知识图谱",
};

export const statusLabels: Record<KnowledgeSourceStatus, string> = {
  ready: "可直接接入",
  review: "需人工校对",
  pipeline: "工具链",
};

export const openKnowledgeSources: OpenKnowledgeSource[] = [
  {
    id: "wikidata",
    name: "Wikidata",
    shortName: "Wikidata",
    summary: "结构化开放知识库，适合补历史人物、事件、地点、政权和时间关系。",
    bestFor: "实体关系、时间轴、人物与事件索引",
    url: "https://www.wikidata.org/wiki/Wikidata:REST_API",
    license: "CC0",
    status: "ready",
    priority: 100,
    useCases: ["knowledge-point", "timeline", "knowledge-graph"],
    strengths: ["结构化程度高", "实体 ID 稳定", "适合做去重和关系补全"],
    cautions: ["中文说明颗粒度不稳定", "教材表述需要二次改写", "不适合直接生成高中答案"],
    integration: "作为实体底座导入人物、事件、地点和时间字段，再映射到现有 KnowledgePointRelation。",
    icon: Database,
  },
  {
    id: "openhistoricalmap",
    name: "OpenHistoricalMap",
    shortName: "OHM",
    summary: "面向历史地理对象的开放地图数据，可作为天地图底图之上的历史覆盖层。",
    bestFor: "历史边界、地点、路线、地图覆盖层",
    url: "https://www.openhistoricalmap.org/",
    license: "CC0 为主，个别要素可能带 license 标签",
    status: "review",
    priority: 95,
    useCases: ["historical-map", "timeline", "source-material"],
    strengths: ["与现有 Leaflet 地图匹配", "支持历史时间属性", "适合做可开关覆盖层"],
    cautions: ["中国古代疆域覆盖不均", "导入前要检查要素来源和 license 标签", "不能替代教材校对"],
    integration: "保留天地图作为 base map，将 OHM 作为 historical overlay 写入 HistoricalMap.overlayJson。",
    icon: Map,
  },
  {
    id: "openstax-world-history",
    name: "OpenStax World History",
    shortName: "OpenStax",
    summary: "开放世界史教材，适合补世界古代史、近现代史背景解释和专题材料。",
    bestFor: "世界史知识点、专题解释、拓展阅读",
    url: "https://openstax.org/subjects/humanities",
    license: "CC BY-NC-SA 4.0",
    status: "review",
    priority: 88,
    useCases: ["knowledge-point", "source-material"],
    strengths: ["教材化结构清晰", "世界史覆盖较好", "适合生成候选讲解"],
    cautions: ["非商业和相同方式共享限制", "需要中文化和教材口径校对", "不能整段搬运"],
    integration: "只作为候选资料池，生成中文摘要后进入人工审核，再写入 content 或 ExtendedReading。",
    icon: GraduationCap,
  },
  {
    id: "oer-commons",
    name: "OER Commons / World History Commons",
    shortName: "OER",
    summary: "开放教育资源集合，适合补史料、课堂活动、主题阅读和材料分析任务。",
    bestFor: "史料实证库、拓展阅读、课堂活动",
    url: "https://www.oercommons.org/",
    license: "逐条资源检查",
    status: "review",
    priority: 82,
    useCases: ["source-material", "knowledge-point"],
    strengths: ["资源类型丰富", "适合史料实证训练", "能补充教材外材料"],
    cautions: ["许可证不统一", "资源质量差异大", "需要建立引用和来源字段"],
    integration: "先做资源清单，不直接入正文；通过 SourceMaterial 保存来源、说明和分析提示。",
    icon: FileSearch,
  },
  {
    id: "openkg-openconcepts",
    name: "OpenKG / OpenConcepts",
    shortName: "OpenKG",
    summary: "中文开放知识图谱生态，可辅助补概念标签、上下位关系和关联词。",
    bestFor: "概念标签、关系补全、知识图谱",
    url: "https://github.com/OpenKG-ORG/OpenConcepts",
    license: "按具体项目检查",
    status: "review",
    priority: 76,
    useCases: ["knowledge-graph", "knowledge-point"],
    strengths: ["中文概念资源较多", "适合做标签扩展", "可辅助相近概念去重"],
    cautions: ["不是高中历史专用", "数据集许可证不完全统一", "需防止泛化概念污染教材体系"],
    integration: "用于生成候选 tags 和 KnowledgePointRelation，不直接覆盖教材知识点标题。",
    icon: Network,
  },
  {
    id: "ragflow",
    name: "RAGFlow",
    shortName: "RAGFlow",
    summary: "开源 RAG 引擎，适合解析 PDF、网页和文档，构建知识点扩充资料池。",
    bestFor: "资料解析、切片、检索、候选内容生成",
    url: "https://github.com/infiniflow/ragflow",
    license: "Apache-2.0",
    status: "pipeline",
    priority: 72,
    useCases: ["ingestion-pipeline"],
    strengths: ["文档解析能力强", "适合搭建审核前资料池", "能减少手工整理成本"],
    cautions: ["不应直接写库", "需要单独部署和权限隔离", "输出必须经过事实与版权审核"],
    integration: "作为外部资料处理服务，导出候选 JSON 后由 Prisma 脚本 upsert。",
    icon: Workflow,
  },
  {
    id: "openspg-kag",
    name: "OpenSPG / KAG",
    shortName: "OpenSPG",
    summary: "知识图谱建模和 KAG 工具链，适合长期构建历史概念、事件与因果关系网络。",
    bestFor: "知识图谱建模、事实关系、复杂推理",
    url: "https://github.com/OpenSPG/openspg",
    license: "Apache-2.0",
    status: "pipeline",
    priority: 65,
    useCases: ["knowledge-graph", "ingestion-pipeline"],
    strengths: ["适合领域模型约束", "能承载复杂关系", "长期扩展空间大"],
    cautions: ["接入成本较高", "第一阶段容易过度设计", "需要先稳定项目内数据模型"],
    integration: "作为二阶段图谱平台，先从 KnowledgePointRelation 和 TimelineEvent 反向导出模型。",
    icon: GitBranch,
  },
  {
    id: "graphrag-lightrag",
    name: "GraphRAG / LightRAG",
    shortName: "GraphRAG",
    summary: "从长文本中抽取实体、关系和社区摘要，适合做批量资料理解和关系候选生成。",
    bestFor: "实体抽取、关系候选、批量文档理解",
    url: "https://github.com/microsoft/graphrag",
    license: "MIT",
    status: "pipeline",
    priority: 58,
    useCases: ["ingestion-pipeline", "knowledge-graph"],
    strengths: ["适合处理大批文本", "能生成关系候选", "适合和 RAGFlow 分工"],
    cautions: ["生成结果必须审核", "历史因果关系容易过度推断", "不适合直接给学生展示"],
    integration: "用于离线生成关系候选清单，再由审核脚本转为 KnowledgePointRelation。",
    icon: Globe2,
  },
];

export function getKnowledgeSourcesByUseCase(useCase: KnowledgeSourceUseCase) {
  return openKnowledgeSources.filter((source) => source.useCases.includes(useCase));
}

export const knowledgeSourcePhases = [
  {
    title: "资料源登记",
    description: "记录来源、用途、许可证、风险和适配字段，先做到可追溯。",
  },
  {
    title: "候选内容生成",
    description: "用 RAGFlow 或脚本将资料转为知识点正文、概念、误区、关系和地图覆盖层候选。",
  },
  {
    title: "事实与版权审核",
    description: "人工确认教材口径、史实准确性、许可证和引用说明，不让外部文本直接进入学生端。",
  },
  {
    title: "幂等入库",
    description: "通过 Prisma upsert 写入 KnowledgePoint、SourceMaterial、HistoricalMap 和 Relation。",
  },
];
