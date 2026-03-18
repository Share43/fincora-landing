import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthVariables } from "../middleware/auth";

export const meetingsRouter = new Hono<{ Variables: AuthVariables }>();

meetingsRouter.use("*", authMiddleware);

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().optional(),
  type: z.enum(["ORDINARY", "EXTRAORDINARY"]),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  agenda: z.string().optional(),
  minutes: z.string().optional(),
  communityId: z.string().min(1),
});

// GET /meetings?communityId=xxx&status=SCHEDULED
meetingsRouter.get("/", async (c) => {
  const adminId = c.get("adminId");
  const { communityId, status } = c.req.query();

  const meetings = await prisma.meeting.findMany({
    where: {
      community: { adminId },
      ...(communityId ? { communityId } : {}),
      ...(status ? { status: status as never } : {}),
    },
    include: { community: { select: { id: true, name: true, slug: true } } },
    orderBy: { date: "desc" },
  });
  return c.json({ data: meetings });
});

// GET /meetings/:id
meetingsRouter.get("/:id", async (c) => {
  const adminId = c.get("adminId");
  const meeting = await prisma.meeting.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
    include: { community: true },
  });
  if (!meeting) return c.json({ error: "Not found" }, 404);
  return c.json({ data: meeting });
});

// POST /meetings
meetingsRouter.post("/", zValidator("json", createSchema), async (c) => {
  const adminId = c.get("adminId");
  const body = c.req.valid("json");

  const community = await prisma.community.findFirst({
    where: { id: body.communityId, adminId },
  });
  if (!community) return c.json({ error: "Community not found" }, 404);

  const meeting = await prisma.meeting.create({
    data: { ...body, date: new Date(body.date) },
  });
  return c.json({ data: meeting }, 201);
});

// PATCH /meetings/:id
meetingsRouter.patch("/:id", zValidator("json", createSchema.partial()), async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.meeting.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const body = c.req.valid("json");
  const meeting = await prisma.meeting.update({
    where: { id: existing.id },
    data: { ...body, ...(body.date ? { date: new Date(body.date) } : {}) },
  });
  return c.json({ data: meeting });
});

// DELETE /meetings/:id
meetingsRouter.delete("/:id", async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.meeting.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.meeting.delete({ where: { id: existing.id } });
  return c.json({ message: "Deleted" });
});
