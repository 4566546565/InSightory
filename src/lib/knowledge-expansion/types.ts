export type ExpansionGap =
  | "content"
  | "keyConcepts"
  | "commonMisconceptions"
  | "mindMap"
  | "questionCoverage"
  | "sourceRefs"
  | "mapOverlay";

export type GapSeverity = "low" | "medium" | "high";

export type CandidateStatus = "draft" | "needs_review" | "approved" | "rejected" | "applied";

export type ExpansionRelationType =
  | "CAUSES"
  | "PRECEDES"
  | "COMPARES"
  | "INFLUENCES"
  | "BELONGS_TO"
  | "GEO_RELATED"
  | "RELATED";

export type KnowledgePointLike = {
  id: string;
  title: string;
  tags: string[];
  content: unknown;
  keyConcepts: unknown;
  commonMisconceptions: unknown;
  mindMapJson: unknown;
  questionCount: number;
};

export type SourceReference = {
  sourceId: string;
  title: string;
  url: string;
  license: string;
  requiresReview: boolean;
};

export type CandidateRelation = {
  targetTitle: string;
  relationType: ExpansionRelationType;
  reason: string;
};

export type CandidateMapOverlay = {
  provider: "openhistoricalmap" | "project";
  title: string;
  query?: string;
  startYear?: number;
  endYear?: number;
};

export type KnowledgeExpansionCandidate = {
  id: string;
  knowledgePointId: string;
  title: string;
  status: CandidateStatus;
  gapSeverity: GapSeverity;
  missing: ExpansionGap[];
  suggestedContent: string;
  keyConcepts: Array<{ term: string; explanation: string }>;
  commonMisconceptions: Array<{ claim: string; correction: string }>;
  relations: CandidateRelation[];
  mapOverlays: CandidateMapOverlay[];
  sourceRefs: SourceReference[];
  createdAt: string;
};

export type GraphNode = {
  id: string;
  title: string;
  lessonTitle?: string;
  tags: string[];
};

export type GraphEdge = {
  sourceId: string;
  targetId: string;
  relationType: ExpansionRelationType;
  weight: number;
  reason: string;
};
