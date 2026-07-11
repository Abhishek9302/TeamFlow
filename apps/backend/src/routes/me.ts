import { Router } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/tasks", async (req: AuthRequest, res) => {
  const result = await pool.query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON t.assignee_user_id = u.id
     WHERE t.assignee_user_id = $1 AND t.completed = false
     ORDER BY t.due_date NULLS LAST, t.created_at DESC`,
    [req.userId]
  );
  res.json({ tasks: result.rows });
});

export default router;