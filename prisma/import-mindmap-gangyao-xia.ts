import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const db = new PrismaClient();

type MindNode = { content: string; children?: MindNode[] };

function countNodes(node: MindNode): number {
  let c = 1;
  if (node.children) for (const ch of node.children) c += countNodes(ch);
  return c;
}

function parseMindmapBlock(block: string): MindNode | null {
  const rawLines = block.split("\n");
  // Filter out empty lines and lines that are just tree chars
  const lines: { text: string; depth: number }[] = [];

  for (const raw of rawLines) {
    const trimmed = raw.trimEnd();
    if (!trimmed.trim()) continue;

    // Count tree prefix depth
    // Patterns: "├─ ", "│  ├─ ", "│  │  ├─ ", "└─ ", "│  └─ "
    const treeMatch = trimmed.match(/^([\s│]*)([├└])─ (.+)$/);
    if (treeMatch) {
      const indent = treeMatch[1];
      const content = treeMatch[3].trim();
      // Each nesting level adds "│  " (3 chars) or "   " (3 chars)
      // Plus the "├─ " or "└─ " prefix itself
      // depth 1: "├─ text"
      // depth 2: "│  ├─ text"
      // depth 3: "│  │  ├─ text"
      // indent.length 0 -> depth 1, 3 -> depth 2, 6 -> depth 3
      const depth = Math.floor(indent.length / 3) + 1;
      lines.push({ text: content, depth });
    } else if (!lines.length) {
      // First line might be the root without tree chars
      lines.push({ text: trimmed.trim(), depth: 0 });
    }
  }

  if (lines.length === 0) return null;

  // Build tree using stack
  const root: MindNode = { content: lines[0].text, children: [] };
  const stack: { node: MindNode; depth: number }[] = [{ node: root, depth: 0 }];

  for (let i = 1; i < lines.length; i++) {
    const { text, depth } = lines[i];

    // Pop until we find a parent with lower depth
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const child: MindNode = { content: text };
    const parent = stack[stack.length - 1].node;
    if (!parent.children) parent.children = [];
    parent.children.push(child);
    stack.push({ node: child, depth });
  }

  return root.children && root.children.length > 0 ? root : null;
}

async function main() {
  console.log("导入纲要下册思维导图...\n");

  const md = readFileSync("C:\\Users\\wait2\\Desktop\\我问问.md", "utf-8");

  // Extract all mindmap blocks
  const blockRegex = /```mindmap\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = blockRegex.exec(md)) !== null) {
    blocks.push(match[1]);
  }
  console.log(`找到 ${blocks.length} 个思维导图块\n`);

  // Parse each block
  const parsed: { root: MindNode; lessonNum: number; shortTitle: string; nodeCount: number }[] = [];

  for (const block of blocks) {
    const tree = parseMindmapBlock(block);
    if (!tree) continue;

    // Extract lesson number and short title
    const numMatch = tree.content.match(/第(\d+)课\s+(.+)/);
    if (!numMatch) continue;
    const lessonNum = parseInt(numMatch[1]);
    const shortTitle = numMatch[2].trim();

    parsed.push({
      root: tree,
      lessonNum,
      shortTitle,
      nodeCount: countNodes(tree),
    });
  }

  // Group by lesson number, pick the most detailed
  const byLesson: Record<number, typeof parsed[0]> = {};
  for (const p of parsed) {
    if (!byLesson[p.lessonNum] || p.nodeCount > byLesson[p.lessonNum].nodeCount) {
      byLesson[p.lessonNum] = p;
    }
  }

  console.log("选定的思维导图:");
  for (const [num, p] of Object.entries(byLesson).sort((a, b) => +a[0] - +b[0])) {
    console.log(`  第${num}课 ${p.shortTitle}: ${p.nodeCount}个节点`);
  }

  // Get lessons from DB
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "纲要" }, volume: "必修", sortOrder: 2 },
  });
  if (!textbook) { console.error("未找到纲要下册"); return; }

  const lessons = await db.lesson.findMany({
    where: { unit: { textbookId: textbook.id } },
    include: { knowledgePoints: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { lessonNumber: "asc" },
  });

  let updated = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    const mindmap = byLesson[lesson.lessonNumber];
    if (!mindmap) {
      console.log(`  跳过: ${lesson.title} (无匹配思维导图)`);
      skipped++;
      continue;
    }

    const firstKP = lesson.knowledgePoints[0];
    if (!firstKP) {
      console.log(`  跳过: ${lesson.title} (无知识点)`);
      skipped++;
      continue;
    }

    await db.knowledgePoint.update({
      where: { id: firstKP.id },
      data: { mindMapJson: mindmap.root },
    });

    console.log(`  ✓ 第${lesson.lessonNumber}课 ${lesson.title} -> ${mindmap.nodeCount}个节点`);
    updated++;
  }

  console.log(`\n完成！更新 ${updated} 课，跳过 ${skipped} 课`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
