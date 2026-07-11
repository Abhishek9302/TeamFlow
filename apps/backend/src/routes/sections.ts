import { Router } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { userCanAccessProject } from "../lib/access";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const projectId = req.params.id;
  if (!(await userCanAccessProject(req.userId, projectId))) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const result = await pool.query(
    "SELECT id, project_id, name, sort_order FROM sections WHERE project_id = $1 ORDER BY sort_order ASC",
    [projectId]
  );
  res.json({ sections: result.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const projectId = req.params.id;
  const { name, sort_order } = req.body;
  if (!name) {
    res.status(400).json({ error: "Name required" });
    return;
  }
  if (!(await userCanAccessProject(req.userId, projectId))) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const result = await pool.query(
    "INSERT INTO sections (project_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id, project_id, name, sort_order",
    [projectId, name, sort_order ?? 0]
  );
  res.status(201).json(result.rows[0]);
});

router.patch("/:sectionId", async (req: AuthRequest, res) => {
  const { name, sort_order } = req.body;
  const section = await pool.query("SELECT * FROM sections WHERE id = $1", [req.params.sectionId]);
  if (!section.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!(await userCanAccessProject(req.userId, section.rows[0].project_id))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const result = await pool.query(
    "UPDATE sections SET name = COALESCE($1, name), sort_order = COALESCE($2, sort_order) WHERE id = $3 RETURNING id, project_id, name, sort_order",
    [name, sort_order, req.params.sectionId]
  );
  res.json(result.rows[0]);
});

router.delete("/:sectionId", async (req: AuthRequest, res) => {
  const section = await pool.query("SELECT * FROM sections WHERE id = $1", [req.params.sectionId]);
  if (!section.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!(await userCanAccessProject(req.userId, section.rows[0].project_id))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await pool.query("UPDATE tasks SET section_id = NULL WHERE section_id = $1", [req.params.sectionId]);
  const result = await pool.query("DELETE FROM sections WHERE id = $1 RETURNING id", [req.params.sectionId]);
  res.json({ deleted: true });
});

export default router;
