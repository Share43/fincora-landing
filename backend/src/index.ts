import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { authRouter } from "./routes/auth";
import { communitiesRouter } from "./routes/communities";
import { incidentsRouter } from "./routes/incidents";
import { documentsRouter } from "./routes/documents";
import { meetingsRouter } from "./routes/meetings";
import { statsRouter } from "./routes/stats";

const app = new Hono();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(logger());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (c) => c.json({ status: "ok" }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.route("/auth", authRouter);
app.route("/stats", statsRouter);
app.route("/communities", communitiesRouter);
app.route("/incidents", incidentsRouter);
app.route("/documents", documentsRouter);
app.route("/meetings", meetingsRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.notFound((c) => c.json({ error: "Not found" }, 404));

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Fincora API running on http://localhost:${port}`);
});
