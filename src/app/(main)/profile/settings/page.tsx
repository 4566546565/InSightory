"use client";

import { useTheme } from "next-themes";
import { useFontSize } from "@/components/providers/font-size-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">设置</h1>
      <div className="space-y-6 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>外观</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>深色模式</Label>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>字体大小</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={fontSize} onValueChange={(v) => setFontSize(v as "sm" | "md" | "lg")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sm" id="sm" />
                <Label htmlFor="sm">小号</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="md" id="md" />
                <Label htmlFor="md">中号（默认）</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lg" id="lg" />
                <Label htmlFor="lg">大号</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
