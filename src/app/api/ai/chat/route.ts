import { requireAuth } from "@/lib/auth-helpers";
import { streamChat } from "@/lib/ai";
import { apiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    await requireAuth();

    const { messages, mode = "tutor", figure } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "请输入消息" } },
        { status: 400 }
      );
    }

    const stream = await streamChat(messages, mode, figure);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
