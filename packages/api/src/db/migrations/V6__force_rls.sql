-- Force RLS to apply to the table owner as well (default is owner bypass).
-- Ensures app connections scoped by app.current_org_id only see their org's data.
ALTER TABLE organizations    FORCE ROW LEVEL SECURITY;
ALTER TABLE org_members      FORCE ROW LEVEL SECURITY;
ALTER TABLE workspaces       FORCE ROW LEVEL SECURITY;
ALTER TABLE programs         FORCE ROW LEVEL SECURITY;
ALTER TABLE projects         FORCE ROW LEVEL SECURITY;
ALTER TABLE milestones       FORCE ROW LEVEL SECURITY;
ALTER TABLE budget_periods   FORCE ROW LEVEL SECURITY;
ALTER TABLE kpis             FORCE ROW LEVEL SECURITY;
ALTER TABLE risks            FORCE ROW LEVEL SECURITY;
ALTER TABLE dependencies     FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_events     FORCE ROW LEVEL SECURITY;
