-- Indexes for dependency lookups (GET /workspaces/:id/projects).
-- Table dependencies is created in V1__core_schema.sql.
CREATE INDEX IF NOT EXISTS idx_dependencies_to_project ON dependencies(to_project_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_from_project ON dependencies(from_project_id);

-- Seed one dependency so the UI shows the dependency icon and arrows when no deps exist yet.
-- "To" project will show as "blocked by" the "from" project.
INSERT INTO dependencies (from_project_id, to_project_id, org_id)
SELECT sub.from_id, sub.to_id, sub.org_id
FROM (
  SELECT p1.id AS from_id, p2.id AS to_id, p1.org_id
  FROM projects p1
  JOIN projects p2 ON p2.workspace_id = p1.workspace_id AND p2.id < p1.id
  WHERE p1.workspace_id = (SELECT id FROM workspaces ORDER BY created_at LIMIT 1)
  LIMIT 1
) sub
WHERE NOT EXISTS (SELECT 1 FROM dependencies);
