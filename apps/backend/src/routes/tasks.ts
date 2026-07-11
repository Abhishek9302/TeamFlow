import { Router } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const result = await pool.query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON t.assignee_user_id = u.id
     WHERE t.owner_id = $1
     ORDER BY t.created_at DESC`,
    [req.userId]
  );
  res.json({ tasks: result.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const { project_id, section_id, title, description, due_date } = req.body;
  if (!title || !project_id) {
    res.status(400).json({ error: "Title and project_id required" });
    return;
  }
  const result = await pool.query(
    `INSERT INTO tasks (project_id, section_id, title, description, due_date, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, project_id, section_id, title, description, due_date, completed, assignee_user_id, created_at`,
    [project_id, section_id || null, title, description || null, due_date || null, req.userId]
  );
  res.status(201).json(result.rows[0]);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const result = await pool.query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON t.assignee_user_id = u.id
     WHERE t.id = $1 AND t.owner_id = $2`,
    [req.params.id, req.userId]
  );
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const { title, description, section_id, due_date, completed, assignee_user_id } = req.body;
  const result = await pool.query(
    `UPDATE tasks SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      section_id = COALESCE($3, section_id),
      due_date = COALESCE($4, due_date),
      completed = COALESCE($5, completed),
      assignee_user_id = COALESCE($6, assignee_user_id)
     WHERE id = $7 AND owner_id = $8
     RETURNING id, project_id, section_id, title, description, due_date, completed, assignee_user_id, created_at`,
    [title, description, section_id, due_date, completed !== undefined ? completed : null, assignee_user_id, req.params.id, req.userId]
  );
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND owner_id = $2 RETURNING id", [req.params.id, req.userId]);
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ deleted: true });
});

export default router;