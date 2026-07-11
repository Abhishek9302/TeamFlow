import { Router } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const result = await pool.query("SELECT id, name, description, created_at FROM projects WHERE owner_id = $1 ORDER BY created_at DESC", [req.userId]);
  res.json({ projects: result.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: "Name required" });
    return;
  }
  const result = await pool.query(
    "INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id, name, description, created_at",
    [name, description || null, req.userId]
  );
  const project = result.rows[0];
  await pool.query(
    "INSERT INTO sections (project_id, name, sort_order) VALUES ($1, 'To do', 0), ($1, 'In progress', 1), ($1, 'Done', 2)",
    [project.id]
  );
  res.status(201).json(project);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const result = await pool.query("SELECT id, name, description, created_at FROM projects WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  const result = await pool.query(
    "UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 AND owner_id = $4 RETURNING id, name, description, created_at",
    [name, description, req.params.id, req.userId]
  );
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await pool.query("DELETE FROM tasks WHERE project_id = $1", [req.params.id]);
  await pool.query("DELETE FROM sections WHERE project_id = $1", [req.params.id]);
  const result = await pool.query("DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id", [req.params.id, req.userId]);
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ deleted: true });
});

export default router;