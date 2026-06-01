import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";

export async function GET() {
  try {
    const textbooks = await db.textbook.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        units: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { lessons: true } } },
        },
      },
    });
    return apiSuccess(textbooks);
  } catch (error) {
    return apiError(error);
  }
}
