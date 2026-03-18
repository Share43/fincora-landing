import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthVariables } from "../middleware/auth";

export const incidentsRouter = new Hono<{ Variables: AuthVariables }>();

incidentsRouter.use("*", authMiddleware);

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  communityId: z.string().min(1),
});

// GET /incidents?communityId=xxx&status=OPEN
incidentsRouter.get("/", async (c) => {
  const adminId = c.get("adminId");
  const { communityId, status } = c.req.query();

  const incidents = await prisma.incident.findMany({
    where: {
      community: { adminId },
      ...(communityId ? { communityId } : {}),
      ...(status ? { status: status as never } : {}),
    },
    include: { community: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return c.json({ data: incidents });
});

// GET /incidents/:id
incidentsRouter.get("/:id", async (c) => {
  const adminId = c.get("adminId");
  const incident = await prisma.incident.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
    include: { community: true },
  });
  if (!incident) return c.json({ error: "Not found" }, 404);
  return c.json({ data: incident });
});

// POST /incidents
incidentsRouter.post("/", zValidator("json", createSchema), async (c) => {
  const adminId = c.get("adminId");
  const body = c.req.valid("json");

  const community = await prisma.community.findFirst({
    where: { id: body.communityId, adminId },
  });
  if (!community) return c.json({ error: "Community not found" }, 404);

  const incident = await prisma.incident.create({ data: body });
  return c.json({ data: incident }, 201);
});

// PATCH /incidents/:id
incidentsRouter.patch("/:id", zValidator("json", createSchema.partial()), async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.incident.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const incident = await prisma.incident.update({
    where: { id: existing.id },
    data: c.req.valid("json"),
  });
  return c.json({ data: incident });
});

// DELETE /incidents/:id
incidentsRouter.delete("/:id", async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.incident.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.incident.delete({ where: { id: existing.id } });
  return c.json({ message: "Deleted" });
});
