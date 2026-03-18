import { Hono } from "hono";
import { prisma } from "../lib/prisma";

export const publicRouter = new Hono();

// Shared helper — resolves community by slug or 404
async function getCommunity(slug: string) {
  return prisma.community.findUnique({
    where: { slug },
    select: {
      id: true, name: true, slug: true, address: true,
      _count: { select: { incidents: true, documents: true, meetings: true, residents: true } },
    },
  });
}

// GET /public/:slug
publicRouter.get("/:slug", async (c) => {
  const community = await getCommunity(c.req.param("slug"));
  if (!community) return c.json({ error: "Community not found" }, 404);

  const openIncidents = await prisma.incident.count({
    where: { communityId: community.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
  });

  const upcomingMeetings = await prisma.meeting.findMany({
    where: { communityId: community.id, status: "SCHEDULED", date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 3,
    select: { id: true, title: true, type: true, date: true, location: true },
  });

  return c.json({ data: { ...community, openIncidents, upcomingMeetings } });
});

// GET /public/:slug/incidents
publicRouter.get("/:slug/incidents", async (c) => {
  const community = await getCommunity(c.req.param("slug"));
  if (!community) return c.json({ error: "Community not found" }, 404);

  const incidents = await prisma.incident.findMany({
    where: { communityId: community.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true,
      status: true, priority: true, createdAt: true,
    },
  });
  return c.json({ data: incidents });
});

// GET /public/:slug/documents
publicRouter.get("/:slug/documents", async (c) => {
  const community = await getCommunity(c.req.param("slug"));
  if (!community) return c.json({ error: "Community not found" }, 404);

  const documents = await prisma.document.findMany({
    where: { communityId: community.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true,
      category: true, fileUrl: true, createdAt: true,
    },
  });
  return c.json({ data: documents });
});

// GET /public/:slug/meetings
publicRouter.get("/:slug/meetings", async (c) => {
  const community = await getCommunity(c.req.param("slug"));
  if (!community) return c.json({ error: "Community not found" }, 404);

  const meetings = await prisma.meeting.findMany({
    where: { communityId: community.id },
    orderBy: { date: "desc" },
    select: {
      id: true, title: true, description: true,
      type: true, status: true, date: true, location: true, agenda: true,
    },
  });
  return c.json({ data: meetings });
});
