-- Enable Row Level Security on all tenant-scoped tables
ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces       ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis             ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events     ENABLE ROW LEVEL SECURITY;

-- The application sets app.current_org_id at the start of every request
-- All RLS policies reference this setting to scope data to the current tenant

-- Organizations: user can only see orgs they are a member of
CREATE POLICY org_isolation ON organizations
  USING (id = current_setting('app.current_org_id', true)::uuid);

-- All other tables: scope by org_id column
CREATE POLICY org_isolation ON org_members      USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON workspaces       USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON programs         USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON projects         USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON milestones       USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON budget_periods   USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON kpis             USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON risks            USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON dependencies     USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY org_isolation ON audit_events     USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Grant the application role access (replace 'roadmapsnap_app' with your DB user)
-- In dev this is your postgres user; in prod create a dedicated role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;
