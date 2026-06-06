"use client";

import { useState, useEffect, useRef } from "react";
import { signInWithCredentials } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, History, Loader2 } from "lucide-react";

// ─── Pupil 组件（跟随鼠标的小瞳孔）──────────────────
interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "black", forceLookX, forceLookY }: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const calc = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = pupilRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = mouseX - cx, dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };
  const p = calc();

  return (
    <div ref={pupilRef} className="rounded-full" style={{
      width: size, height: size, backgroundColor: pupilColor,
      transform: `translate(${p.x}px, ${p.y}px)`, transition: "transform 0.1s ease-out",
    }} />
  );
};

// ─── EyeBall 组件（带白色眼球+瞳孔）────────────────
interface EyeBallProps {
  size?: number; pupilSize?: number; maxDistance?: number;
  eyeColor?: string; pupilColor?: string; isBlinking?: boolean;
  forceLookX?: number; forceLookY?: number;
}

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "black", isBlinking = false, forceLookX, forceLookY }: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const calc = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = eyeRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = mouseX - cx, dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };
  const p = calc();

  return (
    <div ref={eyeRef} className="rounded-full flex items-center justify-center transition-all duration-150" style={{
      width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: "hidden",
    }}>
      {!isBlinking && (
        <div className="rounded-full" style={{
          width: pupilSize, height: pupilSize, backgroundColor: pupilColor,
          transform: `translate(${p.x}px, ${p.y}px)`, transition: "transform 0.1s ease-out",
        }} />
      )}
    </div>
  );
};

// ─── 主登录页面 ─────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  // 鼠标跟踪
  useEffect(() => {
    const handle = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  // 紫色角色眨眼
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); schedule(); }, 150);
      }, Math.random() * 4000 + 3000);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  // 黑色角色眨眼
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); schedule(); }, 150);
      }, Math.random() * 4000 + 3000);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  // 打字时角色互看
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    }
    setIsLookingAtEachOther(false);
  }, [isTyping]);

  // 密码可见时紫色角色偷看
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    }
    setIsPurplePeeking(false);
  }, [password, showPassword]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 3;
    const dx = mouseX - cx, dy = mouseY - cy;
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await signInWithCredentials(email, password);
      if (!result.ok) {
        setError(result.error || "邮箱或密码错误，请重试");
        setIsLoading(false);
      }
      // On success, signInWithCredentials triggers a native form POST
      // which navigates the browser — no further action needed here
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const peeking = password.length > 0 && showPassword;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── 左侧：角色动画区 ── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-12 text-gray-800">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-gray-300/50 backdrop-blur-sm flex items-center justify-center">
              <History className="size-4" />
            </div>
            <span>洞见历史</span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: 550, height: 400 }}>
            {/* 紫色高个角色 - 后层 */}
            <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
              left: 70, width: 180,
              height: (isTyping || (password.length > 0 && !showPassword)) ? 440 : 400,
              backgroundColor: "#6C3FF5", borderRadius: "10px 10px 0 0", zIndex: 1,
              transform: peeking
                ? "skewX(0deg)"
                : (isTyping || (password.length > 0 && !showPassword))
                  ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                  : `skewX(${purplePos.bodySkew || 0}deg)`,
              transformOrigin: "bottom center",
            }}>
              <div className="absolute flex gap-8 transition-all duration-700 ease-in-out" style={{
                left: peeking ? 20 : isLookingAtEachOther ? 55 : 45 + purplePos.faceX,
                top: peeking ? 35 : isLookingAtEachOther ? 65 : 40 + purplePos.faceY,
              }}>
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={peeking ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={peeking ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={peeking ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={peeking ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
              </div>
            </div>

            {/* 黑色角色 - 中层 */}
            <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
              left: 240, width: 120, height: 310,
              backgroundColor: "#2D2D2D", borderRadius: "8px 8px 0 0", zIndex: 2,
              transform: peeking
                ? "skewX(0deg)"
                : isLookingAtEachOther
                  ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                  : (isTyping || (password.length > 0 && !showPassword))
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                    : `skewX(${blackPos.bodySkew || 0}deg)`,
              transformOrigin: "bottom center",
            }}>
              <div className="absolute flex gap-6 transition-all duration-700 ease-in-out" style={{
                left: peeking ? 10 : isLookingAtEachOther ? 32 : 26 + blackPos.faceX,
                top: peeking ? 28 : isLookingAtEachOther ? 12 : 32 + blackPos.faceY,
              }}>
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={peeking ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={peeking ? -4 : isLookingAtEachOther ? -4 : undefined} />
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={peeking ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={peeking ? -4 : isLookingAtEachOther ? -4 : undefined} />
              </div>
            </div>

            {/* 橙色半圆角色 - 前左 */}
            <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
              left: 0, width: 240, height: 200, zIndex: 3,
              backgroundColor: "#FF9B6B", borderRadius: "120px 120px 0 0",
              transform: peeking ? "skewX(0deg)" : `skewX(${orangePos.bodySkew || 0}deg)`,
              transformOrigin: "bottom center",
            }}>
              <div className="absolute flex gap-8 transition-all duration-200 ease-out" style={{
                left: peeking ? 50 : 82 + (orangePos.faceX || 0),
                top: peeking ? 85 : 90 + (orangePos.faceY || 0),
              }}>
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
                  forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
                  forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
              </div>
            </div>

            {/* 黄色角色 - 前右 */}
            <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
              left: 310, width: 140, height: 230, zIndex: 4,
              backgroundColor: "#E8D754", borderRadius: "70px 70px 0 0",
              transform: peeking ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew || 0}deg)`,
              transformOrigin: "bottom center",
            }}>
              <div className="absolute flex gap-6 transition-all duration-200 ease-out" style={{
                left: peeking ? 20 : 52 + (yellowPos.faceX || 0),
                top: peeking ? 35 : 40 + (yellowPos.faceY || 0),
              }}>
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
                  forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
                  forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
              </div>
              <div className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out" style={{
                left: peeking ? 10 : 40 + (yellowPos.faceX || 0),
                top: peeking ? 88 : 88 + (yellowPos.faceY || 0),
              }} />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-gray-500">
          <span className="hover:text-gray-800 transition-colors cursor-pointer">隐私政策</span>
          <span className="hover:text-gray-800 transition-colors cursor-pointer">服务条款</span>
          <span className="hover:text-gray-800 transition-colors cursor-pointer">联系我们</span>
        </div>

        {/* 装饰元素 */}
        <div className="absolute inset-0 bg-grid-gray-800/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-gray-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-gray-200/40 rounded-full blur-3xl" />
      </div>

      {/* ── 右侧：登录表单 ── */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px]">
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="size-4 text-primary" />
            </div>
            <span>洞见历史</span>
          </div>

          {/* 标题 */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">欢迎回来</h1>
            <p className="text-muted-foreground text-sm">请登录你的账号</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱地址"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-background border-border/60 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c as boolean)} />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">记住我</Label>
              </div>
              <span className="text-sm text-primary hover:underline font-medium cursor-pointer">忘记密码？</span>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-medium" size="lg" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 size-5 animate-spin" />登录中...</>
              ) : "登录"}
            </Button>
          </form>

          {/* 注册链接 */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            还没有账号？{" "}
            <Link href="/register" className="text-foreground font-medium hover:underline">
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
