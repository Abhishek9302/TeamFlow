import { Router } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { userCanAccessProject } from "../lib/access";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const projectId = req.query.project_id;
  if (projectId) {
    if (!(await userCanAccessProject(req.userId, String(projectId)))) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const result = await pool.query(
      `SELECT t.*, u.name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_user_id = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );
    res.json({ tasks: result.rows });
    return;
  }
  const result = await pool.query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON t.assignee_user_id = u.id
     WHERE t.owner_id = $1
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = t.project_id AND pm.user_id = $1
        )
     ORDER BY t.created_at DESC`,
    [req.userId]
  );
  res.json({ tasks: result.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const { project_id, section_id, title, description, due_date, assignee_user_id } = req.body;
  if (!title || !project_id) {
    res.status(400).json({ error: "Title and project_id required" });
    return;
  }
  if (!(await userCanAccessProject(req.userId, project_id))) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const result = await pool.query(
    `INSERT INTO tasks (project_id, section_id, title, description, due_date, assignee_user_id, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, project_id, section_id, title, description, due_date, completed, assignee_user_id, created_at`,
    [
      project_id,
      section_id || null,
      title,
      description || null,
      due_date || null,
      assignee_user_id ?? null,
      req.userId,
    ]
  );
  const created = result.rows[0];
  const withName = await pool.query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON t.assignee_user_id = u.id
     WHERE t.id = $1`,
    [created.id]
  );
  res.status(201).json(withName.rows[0]);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const result = await pool.query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON t.assignee_user_id = u.id
     WHERE t.id = $1`,
    [req.params.id]
  );
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const task = result.rows[0];
  if (!(await userCanAccessProject(req.userId, task.project_id))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(task);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const existing = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
  if (!existing.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const task = existing.rows[0];
  if (!(await userCanAccessProject(req.userId, task.project_id))) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { title, description, section_id, due_date, completed, assignee_user_id } = req.body;
  const hasAssignee = Object.prototype.hasOwnProperty.call(req.body, "assignee_user_id");

  const result = await pool.query(
    `UPDATE tasks SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      section_id = COALESCE($3, section_id),
      due_date = COALESCE($4, due_date),
      completed = COALESCE($5, completed),
      assignee_user_id = CASE WHEN $6::boolean THEN $7 ELSE assignee_user_id END
     WHERE id = $8
     RETURNING id, project_id, section_id, title, description, due_date, completed, assignee_user_id, created_at`,
    [
      title,
      description,
      section_id,
      due_date,
      completed !== undefined ? completed : null,
      hasAssignee,
      hasAssignee ? assignee_user_id : null,
      req.params.id,
    ]
  );
  const withName = await pool.query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON t.assignee_user_id = u.id
     WHERE t.id = $1`,
    [result.rows[0].id]
  );
  res.json(withName.rows[0]);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const existing = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
  if (!existing.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!(await userCanAccessProject(req.userId, existing.rows[0].project_id))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
  res.json({ deleted: true });
});

export default router;
