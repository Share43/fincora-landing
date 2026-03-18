import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthVariables } from "../middleware/auth";

export const documentsRouter = new Hono<{ Variables: AuthVariables }>();

documentsRouter.use("*", authMiddleware);

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  category: z.enum(["STATUTES", "MINUTES", "REGULATIONS", "BUDGETS", "OTHER"]),
  communityId: z.string().min(1),
});

// GET /documents?communityId=xxx&category=MINUTES
documentsRouter.get("/", async (c) => {
  const adminId = c.get("adminId");
  const { communityId, category } = c.req.query();

  const documents = await prisma.document.findMany({
    where: {
      community: { adminId },
      ...(communityId ? { communityId } : {}),
      ...(category ? { category: category as never } : {}),
    },
    include: { community: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return c.json({ data: documents });
});

// GET /documents/:id
documentsRouter.get("/:id", async (c) => {
  const adminId = c.get("adminId");
  const document = await prisma.document.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
  });
  if (!document) return c.json({ error: "Not found" }, 404);
  return c.json({ data: document });
});

// POST /documents
documentsRouter.post("/", zValidator("json", createSchema), async (c) => {
  const adminId = c.get("adminId");
  const body = c.req.valid("json");

  const community = await prisma.community.findFirst({
    where: { id: body.communityId, adminId },
  });
  if (!community) return c.json({ error: "Community not found" }, 404);

  const document = await prisma.document.create({ data: body });
  return c.json({ data: document }, 201);
});

// PATCH /documents/:id
documentsRouter.patch("/:id", zValidator("json", createSchema.partial()), async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.document.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const document = await prisma.document.update({
    where: { id: existing.id },
    data: c.req.valid("json"),
  });
  return c.json({ data: document });
});

// DELETE /documents/:id
documentsRouter.delete("/:id", async (c) => {
  const adminId = c.get("adminId");
  const existing = await prisma.document.findFirst({
    where: { id: c.req.param("id"), community: { adminId } },
  });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.document.delete({ where: { id: existing.id } });
  return c.json({ message: "Deleted" });
});
