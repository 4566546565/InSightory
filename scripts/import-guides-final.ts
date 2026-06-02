import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const db = new PrismaClient();

function extractTextFromXml(xmlPath: string): string {
  const xml = readFileSync(xmlPath, "utf-8");
  const texts: string[] = [];
  const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    texts.push(match[1]);
  }
  return texts.join("");
}

function decodeEntities(s: string): string {
  return s.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
}

function parseInline(text: string): any[] {
  const parts: any[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", text: text.slice(last, m.index) });
    parts.push({ type: "text", text: m[1], marks: [{ type: "bold" }] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  if (!parts.length) parts.push({ type: "text", text });
  return parts;
}

/**
 * The entire docx is one continuous string. We need to insert newlines at
 * structural boundaries to create proper TipTap nodes.
 *
 * Strategy: walk char-by-char and detect markers:
 *   ## , ### , ####  → heading breaks
 *   ##### → bold paragraph break
 *   ---  → horizontal rule
 *   >  at start → blockquote
 *   -  after space → bullet
 *   ①②③... → circled number item
 *   "1. " after space → numbered item
 */
function smartSplit(text: string): string[] {
  let s = text;

  // Normalize: add space before heading markers that aren't preceded by space
  // Only handle exact lengths: ##(space), ###(space), ####(space), #####(space)
  // Process from longest to shortest to avoid partial matches
  s = s.replace(/([^\s#])(#{5}) /g, "$1 $2 ");  // ##### with no space before
  s = s.replace(/([^\s#])(#{4}) /g, "$1 $2 ");  // #### with no space before
  s = s.replace(/([^\s#])(#{3}) /g, "$1 $2 ");  // ### with no space before
  s = s.replace(/([^\s#])(#{2}) /g, "$1 $2 ");  // ## with no space before

  // Split on | BEFORE headings — table rows must be separate segments
  s = s.replace(/ \|/g, "\n|");

  // Now insert \n before headings (longest first to avoid #### matching ###)
  // Use (^|\s) to also match at line start (after previous \n insertion)
  s = s.replace(/(^|\s)##### /gm, "$1\n##### ");
  s = s.replace(/(^|\s)####(?!#) /gm, "$1\n#### ");
  s = s.replace(/(^|\s)###(?!#) /gm, "$1\n### ");
  s = s.replace(/(^|\s)##(?!#) /gm, "$1\n## ");

  // Insert \n before horizontal rules
  s = s.replace(/ --- /g, "\n---");

  // NOTE: do NOT split on | here — table handler processes full lines

  // Insert \n before ALL &gt; characters (blockquotes in Word doc)
  // First normalize: add space before &gt; when preceded by non-space
  s = s.replace(/([^\s])(&gt;)/g, "$1 $2");
  // Then split on &gt;
  s = s.replace(/ &gt;/g, "\n>");

  // Insert \n before bullet items
  // Match " -X" when preceded by Chinese character
  s = s.replace(/([一-鿿　-〿＀-￯]) -([^\s])/g, "$1\n-$2");
  s = s.replace(/ - /g, "\n- ");

  // Insert \n before circled numbers, and convert to "N、"
  s = s.replace(/①/g, "\n1、");
  s = s.replace(/②/g, "\n2、");
  s = s.replace(/③/g, "\n3、");
  s = s.replace(/④/g, "\n4、");
  s = s.replace(/⑤/g, "\n5、");
  s = s.replace(/⑥/g, "\n6、");
  s = s.replace(/⑦/g, "\n7、");
  s = s.replace(/⑧/g, "\n8、");
  s = s.replace(/⑨/g, "\n9、");
  s = s.replace(/⑩/g, "\n10、");

  // Split and clean
  return s.split("\n").map(l => l.trim()).filter(l => l.length > 0);
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string }>;
}

function buildTipTap(rawText: string): TipTapNode {
  const segments = smartSplit(rawText);
  const content: TipTapNode[] = [];
  let i = 0;

  while (i < segments.length) {
    const seg = decodeEntities(segments[i]);

    // Horizontal rule
    if (seg === "---") {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // Heading (##, ###, ####)
    const hMatch = seg.match(/^(#{2,4})\s+(.+)/);
    if (hMatch) {
      content.push({
        type: "heading",
        attrs: { level: hMatch[1].length },
        content: parseInline(hMatch[2]),
      });
      i++;
      continue;
    }

    // ##### → bold paragraph (treated as h4 for visual, but semantically a paragraph)
    const h5Match = seg.match(/^#{5}\s+(.+)/);
    if (h5Match) {
      content.push({
        type: "heading",
        attrs: { level: 4 },
        content: [{ type: "text", text: h5Match[1], marks: [{ type: "bold" }] }],
      });
      i++;
      continue;
    }

    // Blockquote - collect consecutive > lines
    if (seg.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < segments.length && decodeEntities(segments[i]).startsWith(">")) {
        quoteLines.push(decodeEntities(segments[i]).replace(/^>\s?/, ""));
        i++;
      }
      // Group into paragraphs
      const qContent: TipTapNode[] = [];
      let buf = "";
      for (const ql of quoteLines) {
        if (ql.trim() === "") {
          if (buf) { qContent.push({ type: "paragraph", content: parseInline(buf) }); buf = ""; }
          continue;
        }
        if (buf) buf += " ";
        buf += ql;
      }
      if (buf) qContent.push({ type: "paragraph", content: parseInline(buf) });
      if (qContent.length) content.push({ type: "blockquote", content: qContent });
      continue;
    }

    // Table (| ... | ... |)
    if (seg.startsWith("|")) {
      const tableRows: string[][] = [];
      while (i < segments.length && decodeEntities(segments[i]).startsWith("|")) {
        const raw = decodeEntities(segments[i]);
        // Split the FULL line on | to get cells
        const cells = raw.split("|").filter((c: string) => c.trim() !== "").map((c: string) => c.trim());
        // Skip separator rows (---, ===, etc.)
        if (cells.length === 0 || cells.every((c: string) => /^[-:=]+$/.test(c))) {
          i++;
          continue;
        }
        tableRows.push(cells);
        i++;
      }
      // Render each row as a formatted paragraph
      for (const row of tableRows) {
        const text = row.join("  |  ");
        content.push({
          type: "paragraph",
          content: [{ type: "text", text, marks: [{ type: "bold" }] }],
        });
      }
      continue;
    }

    // Bullet list
    if (seg.startsWith("- ")) {
      const items: TipTapNode[] = [];
      while (i < segments.length && decodeEntities(segments[i]).startsWith("- ")) {
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInline(decodeEntities(segments[i]).slice(2)) }],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    // Numbered list with 、 (1、2、3、) — keep numbers in text for reliable display
    const cnMatch = seg.match(/^(\d+)、(.+)/);
    if (cnMatch) {
      const items: TipTapNode[] = [];
      while (i < segments.length) {
        const nm = decodeEntities(segments[i]).match(/^(\d+)、(.+)/);
        if (!nm) break;
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInline(nm[1] + "、" + nm[2]) }],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    // Numbered list (1. 2. 3.)
    const numMatch = seg.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      const items: TipTapNode[] = [];
      while (i < segments.length) {
        const nm = decodeEntities(segments[i]).match(/^(\d+)\.\s+(.+)/);
        if (!nm) break;
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInline(nm[2]) }],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    // Regular paragraph
    content.push({ type: "paragraph", content: parseInline(seg) });
    i++;
  }

  // Post-process: merge consecutive orderedLists separated only by blockquotes
  const merged: TipTapNode[] = [];
  let j = 0;
  while (j < content.length) {
    if (content[j].type === "orderedList") {
      // Collect this orderedList plus any blockquotes followed by more orderedLists
      const allItems: TipTapNode[] = [...(content[j].content || [])];
      j++;
      while (j < content.length) {
        if (content[j].type === "orderedList") {
          allItems.push(...(content[j].content || []));
          j++;
        } else if (content[j].type === "blockquote") {
          // Peek ahead: if next non-blockquote is orderedList, skip this blockquote
          let k = j + 1;
          while (k < content.length && content[k].type === "blockquote") k++;
          if (k < content.length && content[k].type === "orderedList") {
            j = k; // skip blockquotes between ordered lists
          } else {
            break;
          }
        } else {
          break;
        }
      }
      merged.push({ type: "orderedList", content: allItems });
    } else {
      merged.push(content[j]);
      j++;
    }
  }

  return { type: "doc", content: merged };
}

async function main() {
  console.log("Importing study guides (final version)...");

  const xmlPath = resolve(__dirname, "../temp_docx/word/document.xml");
  const rawText = extractTextFromXml(xmlPath);
  console.log(`Extracted ${rawText.length} characters`);

  await db.studyGuide.deleteMany();

  // Split into sections
  const section5Idx = rawText.indexOf("## 五、答题术语规范与设问词解读");
  const templatesRaw = section5Idx > 0 ? rawText.slice(0, section5Idx).trim() : rawText;
  const strategiesRaw = section5Idx > 0 ? rawText.slice(section5Idx).trim() : "";

  const templateDoc = buildTipTap(templatesRaw);
  const headings = templateDoc.content.filter((n: any) => n.type === "heading").length;
  const paras = templateDoc.content.filter((n: any) => n.type === "paragraph").length;
  const lists = templateDoc.content.filter((n: any) => n.type === "bulletList" || n.type === "orderedList").length;
  const quotes = templateDoc.content.filter((n: any) => n.type === "blockquote").length;
  console.log(`答题模板: ${templateDoc.content.length} nodes (${headings} headings, ${paras} paras, ${lists} lists, ${quotes} quotes)`);

  await db.studyGuide.create({
    data: {
      title: "历史学科答题模板（全面拓展版）",
      category: "答题模板",
      content: templateDoc,
      tags: ["答题模板", "中考", "高考", "高频题型", "材料题", "小论文"],
    },
  });

  if (strategiesRaw) {
    const strategyDoc = buildTipTap(strategiesRaw);
    console.log(`考试策略: ${strategyDoc.content.length} nodes`);
    await db.studyGuide.create({
      data: {
        title: "答题术语规范与设问词解读",
        category: "考试策略",
        content: strategyDoc,
        tags: ["术语规范", "设问词", "答题要求", "学科术语"],
      },
    });
  }

  // Other guides with proper newlines
  const memoryContent = `## 大事年表记忆口诀

朝代顺序口诀：夏商周秦汉，三国两晋南北朝，隋唐五代宋元明清
重要年份尾数规律：1的年份多大事（1911辛亥革命、1921中共成立、1949建国）
整十整百年的事件要特别关注

## 知识网络构建技巧

- 时间轴法：按时间顺序串联重大事件
- 主题归类法：政治、经济、文化三条线索并行
- 比较联系法：中外对比、古今对比
- 因果链条法：事件之间的因果关系链

## 高效记忆策略

- 理解记忆：先理解再记忆，不死记硬背
- 重复巩固：利用艾宾浩斯遗忘曲线定期复习
- 联想记忆：将新知识与已知知识建立联系
- 画面记忆：将抽象知识转化为具体画面`;

  await db.studyGuide.create({
    data: {
      title: "历史记忆方法",
      category: "记忆方法",
      content: buildTipTap(memoryContent),
      tags: ["记忆方法", "口诀", "时间轴"],
    },
  });

  const planContent = `## 考前复习计划建议

### 第一轮复习（考前2-3个月）

- 系统梳理教材知识，构建完整的知识体系
- 重点关注每单元的导言和小结
- 整理错题本，标注易错点

### 第二轮复习（考前1-2个月）

- 专题复习：按政治、经济、文化等主题归纳
- 强化训练：每周完成2-3套综合试卷
- 查漏补缺：针对薄弱环节重点突破

### 第三轮复习（考前1-2周）

- 回归教材：快速浏览重点章节
- 调整状态：保持良好作息，适度练习
- 考前冲刺：回顾答题模板和常用术语

## 时间管理策略

- 每天固定时间复习历史（建议1-1.5小时）
- 利用碎片时间背诵大事年表和关键概念
- 每周安排一次完整的模拟测试
- 劳逸结合，避免疲劳战术`;

  await db.studyGuide.create({
    data: {
      title: "复习计划与时间管理",
      category: "复习计划",
      content: buildTipTap(planContent),
      tags: ["复习计划", "时间管理", "考前冲刺"],
    },
  });

  const count = await db.studyGuide.count();
  console.log(`\nDone! Total guides: ${count}`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
