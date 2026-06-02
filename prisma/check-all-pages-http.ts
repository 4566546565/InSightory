import { PrismaClient } from "@prisma/client";
import http from "http";
const db = new PrismaClient();

function fetchPage(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode!, body: data }));
    }).on("error", reject);
  });
}

async function main() {
  const textbooks = await db.textbook.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        orderBy: { unitNumber: "asc" },
        include: {
          lessons: {
            orderBy: { lessonNumber: "asc" },
            select: { id: true, title: true, lessonNumber: true },
          },
        },
      },
    },
  });

  // 收集所有课程URL
  const lessons: { url: string; title: string; lessonNumber: number; textbookTitle: string }[] = [];
  for (const t of textbooks) {
    for (const u of t.units) {
      for (const l of u.lessons) {
        lessons.push({
          url: `http://localhost:3002/knowledge/${t.id}/${u.id}/${l.id}`,
          title: l.title,
          lessonNumber: l.lessonNumber,
          textbookTitle: t.title,
        });
      }
    }
  }

  console.log(`=== 逐页检查所有 ${lessons.length} 个课程页面 ===\n`);

  let okCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  // 逐一请求每个页面
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    try {
      const { status, body } = await fetchPage(lesson.url);

      // 检查页面状态
      if (status !== 200) {
        failCount++;
        failures.push(`[${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课 ${lesson.title} - HTTP ${status}`);
        console.log(`  ✗ [${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课: ${lesson.title} - HTTP ${status}`);
        continue;
      }

      // 检查页面是否包含课程内容相关元素
      const hasMindmapTab = body.includes("思维导图");
      const hasKPSection = body.includes("知识点速览") || body.includes("知识点");
      const hasContent = body.includes("课程内容");
      const hasTitle = body.includes(lesson.title);

      if (!hasTitle) {
        failCount++;
        failures.push(`[${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课 ${lesson.title} - 页面标题不匹配`);
        console.log(`  ✗ [${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课: ${lesson.title} - 标题不匹配`);
      } else if (!hasMindmapTab) {
        failCount++;
        failures.push(`[${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课 ${lesson.title} - 缺少思维导图标签`);
        console.log(`  ✗ [${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课: ${lesson.title} - 缺少思维导图标签`);
      } else if (!hasContent) {
        failCount++;
        failures.push(`[${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课 ${lesson.title} - 缺少课程内容标签`);
        console.log(`  ✗ [${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课: ${lesson.title} - 缺少课程内容标签`);
      } else {
        okCount++;
        console.log(`  ✓ [${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课: ${lesson.title}`);
      }
    } catch (err: any) {
      failCount++;
      failures.push(`[${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课 ${lesson.title} - 请求失败: ${err.message}`);
      console.log(`  ✗ [${i + 1}/${lessons.length}] 第${lesson.lessonNumber}课: ${lesson.title} - 请求失败`);
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`📊 页面检查结果`);
  console.log(`${"═".repeat(60)}`);
  console.log(`  总页面数: ${lessons.length}`);
  console.log(`  ✓ 正常: ${okCount}`);
  console.log(`  ✗ 异常: ${failCount}`);
  console.log(`  通过率: ${((okCount / lessons.length) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.log(`\n❌ 失败详情:`);
    failures.forEach(f => console.log(`  ${f}`));
  } else {
    console.log(`\n🎉 全部通过！所有课程页面均可正常访问。`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());