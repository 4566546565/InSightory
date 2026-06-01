"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
    school: "",
    grade: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error?.message || "注册失败");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">注册洞见历史</CardTitle>
        <CardDescription>加入高中历史学习平台</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              placeholder="2-20个字符"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">显示名称</Label>
            <Input
              id="displayName"
              placeholder="你的昵称"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少6位"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school">学校（选填）</Label>
              <Input
                id="school"
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">年级（选填）</Label>
              <Input
                id="grade"
                placeholder="如：高一"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          已有账号？{" "}
          <Link href="/login" className="text-primary hover:underline">
            立即登录
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
