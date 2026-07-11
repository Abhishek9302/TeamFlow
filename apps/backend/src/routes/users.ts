import { Router } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (_req: AuthRequest, res) => {
  const result = await pool.query(
    "SELECT id, name, email FROM users ORDER BY name NULLS LAST, email ASC"
  );
  res.json({ users: result.rows });
});

export default router;
