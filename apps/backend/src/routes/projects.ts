import { Router } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { userCanAccessProject } from "../lib/access";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const result = await pool.query(
    `SELECT DISTINCT p.id, p.name, p.description, p.created_at
     FROM projects p
     LEFT JOIN project_members pm ON pm.project_id = p.id
     WHERE p.owner_id = $1 OR pm.user_id = $1
     ORDER BY p.created_at DESC`,
    [req.userId]
  );
  res.json({ projects: result.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: "Name required" });
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id, name, description, created_at",
      [name, description || null, req.userId]
    );
    const project = result.rows[0];
    await client.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')",
      [project.id, req.userId]
    );
    await client.query(
      "INSERT INTO sections (project_id, name, sort_order) VALUES ($1, 'To do', 0), ($1, 'In progress', 1), ($1, 'Done', 2)",
      [project.id]
    );
    await client.query("COMMIT");
    res.status(201).json(project);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

router.get("/:id/members", async (req: AuthRequest, res) => {
  const projectId = req.params.id;
  if (!(await userCanAccessProject(req.userId, projectId))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, pm.role, pm.created_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY CASE WHEN pm.role = 'owner' THEN 0 ELSE 1 END, u.name NULLS LAST, u.email`,
    [projectId]
  );
  res.json({ members: result.rows });
});

router.post("/:id/members", async (req: AuthRequest, res) => {
  const projectId = req.params.id;
  if (!(await userCanAccessProject(req.userId, projectId))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }
  const userResult = await pool.query(
    "SELECT id, name, email FROM users WHERE LOWER(email) = $1",
    [email]
  );
  if (!userResult.rows.length) {
    res.status(404).json({ error: "No registered user with that email" });
    return;
  }
  const user = userResult.rows[0];
  try {
    await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING",
      [projectId, user.id]
    );
  } catch {
    res.status(500).json({ error: "Failed to add member" });
    return;
  }
  const member = await pool.query(
    `SELECT u.id, u.name, u.email, pm.role, pm.created_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1 AND pm.user_id = $2`,
    [projectId, user.id]
  );
  res.status(201).json(member.rows[0]);
});

router.delete("/:id/members/:userId", async (req: AuthRequest, res) => {
  const projectId = req.params.id;
  const memberUserId = req.params.userId;
  if (!(await userCanAccessProject(req.userId, projectId))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const ownerCheck = await pool.query(
    `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
    [projectId, memberUserId]
  );
  if (!ownerCheck.rows.length) {
    res.status(404).json({ error: "Member not found" });
    return;
  }
  if (ownerCheck.rows[0].role === "owner") {
    res.status(400).json({ error: "Cannot remove project owner" });
    return;
  }
  // Also block removing the projects.owner_id even if role drifted
  const proj = await pool.query("SELECT owner_id FROM projects WHERE id = $1", [projectId]);
  if (proj.rows[0] && String(proj.rows[0].owner_id) === String(memberUserId)) {
    res.status(400).json({ error: "Cannot remove project owner" });
    return;
  }
  await pool.query("DELETE FROM project_members WHERE project_id = $1 AND user_id = $2", [
    projectId,
    memberUserId,
  ]);
  res.json({ deleted: true });
});

router.get("/:id", async (req: AuthRequest, res) => {
  if (!(await userCanAccessProject(req.userId, req.params.id))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const result = await pool.query(
    "SELECT id, name, description, created_at FROM projects WHERE id = $1",
    [req.params.id]
  );
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
  const result = await pool.query("DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id", [
    req.params.id,
    req.userId,
  ]);
  if (!result.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ deleted: true });
});

export default router;
