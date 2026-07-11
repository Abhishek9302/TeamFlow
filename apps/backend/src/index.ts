import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { pool } from "./db";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import sectionsRouter from "./routes/sections";
import tasksRouter from "./routes/tasks";
import meRouter from "./routes/me";
import usersRouter from "./routes/users";

const app = express();
const PORT = Number(process.env.PORT || "8080");

app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean).length
      ? (process.env.ALLOWED_ORIGINS || "").split(",")
      : true,
    credentials: true,
  })
);
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:id/sections", sectionsRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/me", meRouter);

async function initSchema() {
  const candidates = [
    path.join(__dirname, "../../database/schema.sql"),
    path.join(__dirname, "../../../database/schema.sql"),
    path.join(process.cwd(), "database/schema.sql"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const sql = fs.readFileSync(p, "utf-8");
      await pool.query(sql);
      console.log("Schema applied from", p);
      return;
    }
  }
  console.warn("schema.sql not found in any candidate path");
}

initSchema().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on ${PORT}`);
  });
});
