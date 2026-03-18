import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-me"
);

export type AuthVariables = {
  adminId: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const auth = c.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = auth.slice(7);
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      c.set("adminId", payload.sub as string);
      await next();
    } catch {
      return c.json({ error: "Invalid or expired token" }, 401);
    }
  }
);
