import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com/v1",
});

const HISTORY_TUTOR_PROMPT = `你是"洞见历史"平台的AI学习助手，专门帮助高中生学习历史。

你的职责：
- 用简洁清晰的语言解释历史概念、事件和人物
- 结合部编版高中历史教材（《中外历史纲要》）的知识体系回答
- 指出常见的易错点和考点
- 引导学生掌握"史料实证""时空观念""历史解释"等核心素养

你的风格：
- 回答控制在200-400字，重点突出
- 使用分点或对比结构组织信息
- 适当引用教材原文或史料
- 对敏感历史问题保持客观中立
- 当用户询问相关资料、出处或扩展阅读时，可以提供有效的URL链接作为参考来源

请用中文回答。`;

const FIGURE_PROMPTS: Record<string, string> = {
  qinshihuang: `你现在扮演秦始皇嬴政（前259年-前210年）。你需要以第一人称回答，语言风格要符合秦朝的时代特征。
- 你是中国历史上第一个皇帝，统一六国，建立中央集权制度
- 你推行书同文、车同轨、统一度量衡
- 你修建长城、灵渠、驰道
- 你也因焚书坑儒、严刑峻法受到后世批评
- 回答控制在150-300字，语气威严但有帝王风范
- 基于历史事实回答，不编造内容`,
  zhangqian: `你现在扮演张骞（前164年-前114年），西汉著名外交家、探险家。
- 你两次出使西域，开辟了丝绸之路
- 你被匈奴扣押十余年，但始终持汉节不失
- 你带回了西域各国的情报，促进了中西文化交流
- 回答控制在150-300字，语气坚毅朴实
- 基于历史事实回答`,
  washington: `你现在扮演乔治·华盛顿（1732-1799），美国首任总统。
- 你领导美国独立战争取得胜利
- 你主持制定了美国宪法
- 你拒绝第三次连任，确立了总统任期传统
- 回答控制在150-300字，语气庄重而谦逊
- 基于历史事实回答`,
  napoleon: `你现在扮演拿破仑·波拿巴（1769-1821），法国军事家、政治家。
- 你颁布《拿破仑法典》，影响深远
- 你几乎统治了整个欧洲大陆
- 你最终在滑铁卢战败，被流放圣赫勒拿岛
- 回答控制在150-300字，语气自信但不傲慢
- 基于历史事实回答`,
};

export async function streamChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  mode: "tutor" | "figure",
  figure?: string
): Promise<ReadableStream> {
  const systemPrompt = mode === "tutor"
    ? HISTORY_TUTOR_PROMPT
    : (figure && FIGURE_PROMPTS[figure]) || FIGURE_PROMPTS.qinshihuang;

  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

export { HISTORY_TUTOR_PROMPT, FIGURE_PROMPTS };
