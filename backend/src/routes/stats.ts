import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthVariables } from "../middleware/auth";

export const statsRouter = new Hono<{ Variables: AuthVariables }>();

statsRouter.use("*", authMiddleware);

// GET /stats  — dashboard summary for the authenticated admin
statsRouter.get("/", async (c) => {
  const adminId = c.get("adminId");
  const now = new Date();

  const [
    totalCommunities,
    openIncidents,
    totalDocuments,
    upcomingMeetings,
    totalResidents,
    recentIncidents,
    communities,
  ] = await Promise.all([
    prisma.community.count({ where: { adminId } }),

    prisma.incident.count({
      where: { community: { adminId }, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),

    prisma.document.count({ where: { community: { adminId } } }),

    prisma.meeting.count({
      where: { community: { adminId }, status: "SCHEDULED", date: { gte: now } },
    }),

    prisma.resident.count({ where: { community: { adminId } } }),

    prisma.incident.findMany({
      where: { community: { adminId } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, title: true, status: true, priority: true, createdAt: true,
        community: { select: { id: true, name: true, slug: true } },
      },
    }),

    prisma.community.findMany({
      where: { adminId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { incidents: true, documents: true, meetings: true },
        },
      },
    }),
  ]);

  return c.json({
    data: {
      kpis: { totalCommunities, openIncidents, totalDocuments, upcomingMeetings, totalResidents },
      recentIncidents,
      communities,
    },
  });
});
