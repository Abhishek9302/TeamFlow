import { pool } from "../db";

export async function userCanAccessProject(
  userId: string | number | undefined,
  projectId: string | number
): Promise<boolean> {
  if (userId == null) return false;
  const result = await pool.query(
    `SELECT 1 FROM projects p
     WHERE p.id = $1 AND (
       p.owner_id = $2
       OR EXISTS (
         SELECT 1 FROM project_members pm
         WHERE pm.project_id = p.id AND pm.user_id = $2
       )
     )`,
    [projectId, userId]
  );
  return result.rows.length > 0;
}

export async function getAccessibleProjectIds(userId: string | number | undefined): Promise<number[]> {
  if (userId == null) return [];
  const result = await pool.query(
    `SELECT DISTINCT p.id FROM projects p
     LEFT JOIN project_members pm ON pm.project_id = p.id
     WHERE p.owner_id = $1 OR pm.user_id = $1`,
    [userId]
  );
  return result.rows.map((r) => r.id as number);
}
