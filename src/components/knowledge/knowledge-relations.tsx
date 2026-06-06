import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { relationTypeLabels } from "@/lib/knowledge-expansion/knowledge-graph";
import type { ExpansionRelationType } from "@/lib/knowledge-expansion/types";

export type KnowledgeRelationItem = {
  id: string;
  relationType: string;
  direction: "from" | "to";
  point: {
    id: string;
    title: string;
    lesson: {
      id: string;
      unitId: string;
      unit: { textbookId: string };
    };
  };
};

function relationLabel(type: string) {
  return relationTypeLabels[type as ExpansionRelationType] ?? type;
}

export function KnowledgeRelations({ relations }: { relations: KnowledgeRelationItem[] }) {
  if (relations.length === 0) return null;

  return (
    <Card className="mt-8 border-0 shadow-card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary/60 via-gold/30 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-serif">
          <GitBranch className="h-5 w-5 text-primary" />
          关联知识图谱
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {relations.map((relation) => {
          const href = `/knowledge/${relation.point.lesson.unit.textbookId}/${relation.point.lesson.unitId}/${relation.point.lesson.id}/${relation.point.id}`;
          return (
            <Link
              key={relation.id}
              href={href}
              className="rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium leading-snug">{relation.point.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {relation.direction === "from" ? "指向知识点" : "来源知识点"}
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {relationLabel(relation.relationType)}
                </Badge>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
