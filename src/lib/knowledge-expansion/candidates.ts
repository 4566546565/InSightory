import { buildCandidateSourceRefs } from "./external-sources";
import { getOhmOverlayQuery } from "./ohm";
import type { OpenKnowledgeSource } from "@/data/open-knowledge-sources";
import type {
  CandidateMapOverlay,
  CandidateRelation,
  ExpansionGap,
  GapSeverity,
  KnowledgeExpansionCandidate,
  KnowledgePointLike,
} from "./types";

function isEmptyRichValue(value: unknown) {
  if (!value) return true;
  const text = JSON.stringify(value);
  return text.length < 40 || /详见|待补充|暂无/.test(text);
}

function isEmptyArrayValue(value: unknown) {
  return !Array.isArray(value) || value.length === 0;
}

export function classifyGap(point: KnowledgePointLike): { missing: ExpansionGap[]; severity: GapSeverity } {
  const missing: ExpansionGap[] = [];
  if (isEmptyRichValue(point.content)) missing.push("content");
  if (isEmptyArrayValue(point.keyConcepts)) missing.push("keyConcepts");
  if (isEmptyArrayValue(point.commonMisconceptions)) missing.push("commonMisconceptions");
  if (isEmptyRichValue(point.mindMapJson)) missing.push("mindMap");
  if (point.questionCount < 3) missing.push("questionCoverage");
  if (/地图|疆域|路线|航路|边疆|地理|丝绸之路|新航路|战争/.test(`${point.title} ${point.tags.join(" ")}`)) {
    missing.push("mapOverlay");
  }
  missing.push("sourceRefs");

  const severity: GapSeverity = missing.length >= 5 ? "high" : missing.length >= 3 ? "medium" : "low";
  return { missing, severity };
}

function relationSuggestions(point: KnowledgePointLike): CandidateRelation[] {
  const text = `${point.title} ${point.tags.join(" ")}`;
  const relations: CandidateRelation[] = [
    {
      targetTitle: "同课前置知识点",
      relationType: "PRECEDES",
      reason: "补充时应检查同课知识点顺序，避免孤立解释。",
    },
    {
      targetTitle: "相关专题线索",
      relationType: "BELONGS_TO",
      reason: "可纳入专题史贯通，用于跨课复习。",
    },
  ];

  if (/原因|条件|影响|推动|导致|结果|新航路|工业革命|殖民/.test(text)) {
    relations.unshift({
      targetTitle: "因果链上下游知识点",
      relationType: "CAUSES",
      reason: "该主题适合建立原因、过程和影响链条。",
    });
  }

  if (/地图|疆域|路线|航路|丝绸之路|边疆|战争/.test(text)) {
    relations.push({
      targetTitle: "历史地图图层",
      relationType: "GEO_RELATED",
      reason: "该主题需要地理空间对象辅助理解。",
    });
  }

  return relations;
}

function mapOverlaySuggestions(point: KnowledgePointLike): CandidateMapOverlay[] {
  const keywords = [point.title, ...point.tags].filter(Boolean);
  if (!/地图|疆域|路线|航路|丝绸之路|新航路|战争|边疆|殖民/.test(keywords.join(" "))) return [];
  const ohm = getOhmOverlayQuery(keywords, -300, 2024);
  return [{
    provider: "openhistoricalmap",
    title: `${point.title}：历史地理对象候选`,
    query: ohm.query,
    startYear: -300,
    endYear: 2024,
  }];
}

function conceptTerms(point: KnowledgePointLike) {
  const tags = point.tags.slice(0, 4);
  return [
    {
      term: point.title,
      explanation: `围绕“${point.title}”补充背景、过程、影响和教材定位，形成可用于复习的完整解释。`,
    },
    {
      term: "时空定位",
      explanation: "明确事件或制度所处时代、区域和前后联系，支撑历史解释。",
    },
    {
      term: "史料实证",
      explanation: "补充内容应能回到材料、出处或开放资料源，避免无来源断言。",
    },
    ...tags.map((tag) => ({
      term: tag,
      explanation: `“${tag}”是该知识点扩充时需要保留的关键词。`,
    })),
  ];
}

export function buildCandidateForKnowledgePoint(
  point: KnowledgePointLike,
  sources: OpenKnowledgeSource[] = []
): KnowledgeExpansionCandidate {
  const gap = classifyGap(point);
  const sourceRefs = buildCandidateSourceRefs(point);
  const sourceNames = (sources.length > 0 ? sources.map((source) => source.name) : sourceRefs.map((ref) => ref.title)).join("、");

  return {
    id: `candidate-${point.id}`,
    knowledgePointId: point.id,
    title: point.title,
    status: "needs_review",
    gapSeverity: gap.severity,
    missing: gap.missing,
    suggestedContent:
      `【候选补充】${point.title}需要从教材线索、开放资料源和考试要求三个层面扩充。` +
      `建议先确认其时代背景与核心事实，再说明它与前后知识点的关系。` +
      `可参考${sourceNames || "项目内教材内容"}生成候选摘要，但最终表述必须保持高中历史教材口径，` +
      "并补充常见误区、关键词解释、题目关联和来源引用。",
    keyConcepts: conceptTerms(point),
    commonMisconceptions: [
      {
        claim: `只背“${point.title}”的结论即可。`,
        correction: "应同时掌握背景、过程、影响和材料依据，才能适配选择题与材料题。",
      },
      {
        claim: "开放资料源中的表述可以直接写入学生端。",
        correction: "外部资料必须经过事实、版权和教材口径审核后再入库。",
      },
    ],
    relations: relationSuggestions(point),
    mapOverlays: mapOverlaySuggestions(point),
    sourceRefs,
    createdAt: new Date().toISOString(),
  };
}

export function summarizeCandidates(candidates: KnowledgeExpansionCandidate[]) {
  return {
    total: candidates.length,
    high: candidates.filter((item) => item.gapSeverity === "high").length,
    needsReview: candidates.filter((item) => item.status === "needs_review").length,
    mapOverlay: candidates.filter((item) => item.mapOverlays.length > 0).length,
  };
}
