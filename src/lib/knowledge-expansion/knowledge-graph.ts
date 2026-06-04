import type { ExpansionRelationType, GraphEdge, GraphNode } from "./types";

export const relationTypeLabels: Record<ExpansionRelationType, string> = {
  CAUSES: "因果",
  PRECEDES: "时间先后",
  COMPARES: "对比",
  INFLUENCES: "影响",
  BELONGS_TO: "所属专题",
  GEO_RELATED: "地理关联",
  RELATED: "相关",
};

function inferRelationType(a: GraphNode, b: GraphNode): ExpansionRelationType {
  const joined = `${a.title} ${b.title} ${a.tags.join(" ")} ${b.tags.join(" ")}`;
  if (/原因|条件|影响|结果|推动|导致/.test(joined)) return "CAUSES";
  if (/对比|比较|异同|两次|中外/.test(joined)) return "COMPARES";
  if (/地图|疆域|路线|航路|边疆|地理|丝绸之路/.test(joined)) return "GEO_RELATED";
  if (/专题|制度|文化|思想|政治|经济/.test(joined)) return "BELONGS_TO";
  return "RELATED";
}

function sharedTagCount(a: GraphNode, b: GraphNode) {
  const bTags = new Set(b.tags);
  return a.tags.filter((tag) => bTags.has(tag)).length;
}

export function buildKnowledgeGraphPreview(nodes: GraphNode[]) {
  const edges: GraphEdge[] = [];

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const shared = sharedTagCount(a, b);
      const sameLesson = a.lessonTitle && a.lessonTitle === b.lessonTitle;
      const titleOverlap = a.title.slice(0, 2) === b.title.slice(0, 2);
      if (!shared && !sameLesson && !titleOverlap) continue;

      edges.push({
        sourceId: a.id,
        targetId: b.id,
        relationType: inferRelationType(a, b),
        weight: shared * 2 + (sameLesson ? 2 : 0) + (titleOverlap ? 1 : 0),
        reason: shared
          ? `共享标签：${a.tags.filter((tag) => b.tags.includes(tag)).join("、")}`
          : sameLesson
            ? "同属一课"
            : "标题主题相近",
      });
    }
  }

  return { nodes, edges: edges.sort((a, b) => b.weight - a.weight) };
}

export function relationTypeOptions() {
  return Object.entries(relationTypeLabels).map(([value, label]) => ({ value, label }));
}
