import { unstable_cache } from "next/cache";
import { db } from "./db";

export const getTextbooks = unstable_cache(
  async () => {
    return db.textbook.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        units: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { lessons: true } } },
        },
      },
    });
  },
  ["textbooks"],
  { revalidate: 3600, tags: ["textbooks"] }
);

export const getTimelineEvents = unstable_cache(
  async () => {
    return db.timelineEvent.findMany({
      take: 500,
      orderBy: { startDate: "asc" },
    });
  },
  ["timeline-events"],
  { revalidate: 3600, tags: ["timeline-events"] }
);

export const getTodayInHistory = unstable_cache(
  async (month: number, day: number) => {
    return db.todayInHistory.findMany({
      where: { month, day },
      take: 6,
    });
  },
  ["today-in-history"],
  { revalidate: 86400, tags: ["today-in-history"] }
);
