import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "../lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-me"
);

export const authRouter = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/register", zValidator("json", registerSchema), async (c) => {
  const { name, email, password } = c.req.valid("json");

  const existing = await prisma.administrator.findUnique({ where: { email } });
  if (existing) return c.json({ error: "Este correo ya está registrado." }, 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.administrator.create({
    data: { name, email, passwordHash },
  });

  const token = await new SignJWT({ sub: admin.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return c.json(
    { token, admin: { id: admin.id, email: admin.email, name: admin.name } },
    201
  );
});

authRouter.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const admin = await prisma.administrator.findUnique({ where: { email } });
  if (!admin) return c.json({ error: "Invalid credentials" }, 401);

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  const token = await new SignJWT({ sub: admin.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return c.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
});
