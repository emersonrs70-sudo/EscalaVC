import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { dbEmployees, dbManualOverrides, dbSwapRequests } from "./src/db/schema.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", database: "connected" });
  });

  // Sync user with Cloud SQL
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No user authenticated" });
      }
      const dbUser = await getOrCreateUser(req.user.uid, req.user.email || "user@example.com");
      res.json({ success: true, user: dbUser });
    } catch (error) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: "Failed to sync user with database" });
    }
  });

  // Get employees from DB
  app.get("/api/employees", async (_req, res) => {
    try {
      const employeesList = await db.select().from(dbEmployees);
      res.json(employeesList);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  // Get swap requests from DB
  app.get("/api/swap-requests", async (_req, res) => {
    try {
      const requests = await db.select().from(dbSwapRequests);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      res.status(500).json({ error: "Failed to fetch swap requests" });
    }
  });

  // Get manual overrides from DB
  app.get("/api/manual-overrides", async (_req, res) => {
    try {
      const overrides = await db.select().from(dbManualOverrides);
      res.json(overrides);
    } catch (error) {
      console.error("Error fetching manual overrides:", error);
      res.status(500).json({ error: "Failed to fetch manual overrides" });
    }
  });

  // Vite middleware in development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
