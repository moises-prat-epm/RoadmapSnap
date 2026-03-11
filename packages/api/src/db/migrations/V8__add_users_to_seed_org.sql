-- Add all existing users to the config-seed org so they can see seeded workspaces.
-- Run this if you already applied V7 before the "add users to seed org" step was added.
INSERT INTO org_members (org_id, user_id, role)
SELECT o.id, u.id, 'admin'
FROM organizations o
CROSS JOIN users u
WHERE o.slug = 'config-seed-org'
ON CONFLICT (org_id, user_id) DO NOTHING;
