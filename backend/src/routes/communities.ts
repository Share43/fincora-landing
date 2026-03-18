import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthVariables } from "../middleware/auth";

export const communitiesRouter = new Hono<{ Variables: AuthVariables }>();

communitiesRouter.use("*", authMiddleware);

// GET /communities
communitiesRouter.get("/", async (c) => {
  const adminId = c.get("adminId");
  const communities = await prisma.community.findMany({
    where: { adminId },
    include: {
      _count: {
        select: {
          incidents: true,
          documents: true,
          meetings: true,
          residents: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Attach open-incident count (OPEN | IN_PROGRESS) per community
  const openCounts = await prisma.incident.groupBy({
    by: ["communityId"],
    where: {
      communityId: { in: communities.map((c) => c.id) },
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
    _count: { _all: true },
  });
  const openByComm = Object.fromEntries(
    openCounts.map((r) => [r.communityId, r._count._all])
  );

  const data = communities.map((comm) => ({
    ...comm,
    openIncidents: openByComm[comm.id] ?? 0,
  }));

  return c.json({ data });
});

// GET /communities/:id
communitiesRouter.get("/:id", async (c) => {
  const adminId = c.get("adminId");
  const community = await prisma.community.findFirst({
    where: { id: c.req.param("id"), adminId },
    include: { residents: true, _count: { select: { incidents: true, documents: true, meetings: true } } },
  });
  if (!community) return c.json({ error: "Not found" }, 404);
  return c.json({ data: community });
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Only lowercase, numbers and hyphens"),
  address: z.string().min(1),
});

// POST /communities
communitiesRouter.post("/", zValidator("json", createSchema), async (c) => {
  const adminId = c.get("adminId");
  const body = c.req.valid("json");
  const community = await prisma.community.create({
    data: { ...body, adminId },
  });
  return c.json({ data: community }, 201);
});

const updateSchema = createSchema.partial();

// PATCH /communities/:id
communitiesRouter.patch("/:id", zValidator("json", updateSchema), async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.community.findFirst({
    where: { id: c.req.param("id"), adminId },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const community = await prisma.community.update({
    where: { id: existing.id },
    data: c.req.valid("json"),
  });
  return c.json({ data: community });
});

// DELETE /communities/:id
communitiesRouter.delete("/:id", async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.community.findFirst({
    where: { id: c.req.param("id"), adminId },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.community.delete({ where: { id: existing.id } });
  return c.json({ message: "Deleted" });
});
