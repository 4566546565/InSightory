import { AlertTriangle } from "lucide-react";

export function DbErrorBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          数据库未连接
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          请安装并启动 PostgreSQL 后刷新页面。命令：<code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">docker compose up -d</code>
        </p>
      </div>
    </div>
  );
}
