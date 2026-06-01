"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RichContent } from "@/components/knowledge/rich-content";

interface QuestionCardProps {
  question: {
    id: string;
    type: string;
    difficulty: number;
    stem: unknown;
    options: unknown;
  };
  index: number;
  total: number;
  selectedAnswer?: unknown;
  onAnswer: (questionId: string, answer: unknown) => void;
}

export function QuestionCard({ question, index, total, selectedAnswer, onAnswer }: QuestionCardProps) {
  const options = (question.options as Array<{ label: string; content: string }>) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            第 {index + 1}/{total} 题
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {question.type === "MC" ? "单选题" : question.type === "MULTI_SELECT" ? "多选题" : "判断题"}
            </Badge>
            <Badge variant="outline">{"★".repeat(question.difficulty)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-base">
          <RichContent content={question.stem} />
        </div>

        {question.type === "MC" || question.type === "TRUE_FALSE" ? (
          <RadioGroup
            value={selectedAnswer as string}
            onValueChange={(v) => onAnswer(question.id, v)}
            className="space-y-3"
          >
            {options.map((opt) => (
              <div
                key={opt.label}
                className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent transition-colors cursor-pointer"
              >
                <RadioGroupItem value={opt.label} id={`${question.id}-${opt.label}`} />
                <Label htmlFor={`${question.id}-${opt.label}`} className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.content}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : question.type === "MULTI_SELECT" ? (
          <div className="space-y-3">
            {options.map((opt) => (
              <div
                key={opt.label}
                className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <Checkbox
                  id={`${question.id}-${opt.label}`}
                  checked={Array.isArray(selectedAnswer) && (selectedAnswer as string[]).includes(opt.label)}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(selectedAnswer) ? (selectedAnswer as string[]) : [];
                    const updated = checked
                      ? [...current, opt.label]
                      : current.filter((l) => l !== opt.label);
                    onAnswer(question.id, updated);
                  }}
                />
                <Label htmlFor={`${question.id}-${opt.label}`} className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.content}
                </Label>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
