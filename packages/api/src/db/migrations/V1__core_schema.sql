-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- organizations: top-level tenant boundary
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  plan          TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','professional','enterprise')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- users: one row per authenticated user
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- org_members: user membership and role within an org
CREATE TABLE org_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer','editor','admin')),
  invited_by    UUID REFERENCES users(id),
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

-- workspaces: a PMO workspace within an org
CREATE TABLE workspaces (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL,
  workflow_definition JSONB NOT NULL DEFAULT '[]',
  entity_labels       JSONB NOT NULL DEFAULT '{}',
  dashboard_text      JSONB NOT NULL DEFAULT '{}',
  settings            JSONB NOT NULL DEFAULT '{}',
  created_by          UUID NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, slug)
);

-- programs: optional grouping level under a workspace
CREATE TABLE programs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  org_id        UUID NOT NULL REFERENCES organizations(id),
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- projects: core deliverable entity (maps to DELIVERABLES[] in config.js)
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id),
  program_id      UUID REFERENCES programs(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  group_name      TEXT,
  at_risk         BOOLEAN NOT NULL DEFAULT FALSE,
  descoped        BOOLEAN NOT NULL DEFAULT FALSE,
  show_in_timeline BOOLEAN NOT NULL DEFAULT TRUE,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  external_link   TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, name)
);

-- milestones: belongs to project, state machine governed
CREATE TABLE milestones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id),
  milestone_key   TEXT NOT NULL,
  planned_date    DATE,
  actual_date     DATE,
  completion_pct  INTEGER NOT NULL DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
  status          TEXT NOT NULL DEFAULT 'planned'
                  CHECK (status IN ('planned','in_progress','at_risk','delayed','complete','cancelled')),
  notes           TEXT,
  updated_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, milestone_key)
);

-- budget_periods: financial tracking per project per period
-- actuals stored as encrypted bytea (AES-256 via pgcrypto)
CREATE TABLE budget_periods (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  period_type     TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('weekly','monthly','quarterly')),
  currency        TEXT NOT NULL DEFAULT 'USD',
  planned         NUMERIC(18,2) NOT NULL DEFAULT 0,
  forecast        NUMERIC(18,2) NOT NULL DEFAULT 0,
  actuals_encrypted BYTEA,
  variance_threshold_amber NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  variance_threshold_red   NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, period_start, period_type)
);

-- kpis: time-series KPI values per workspace
CREATE TABLE kpis (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id),
  kpi_key         TEXT NOT NULL,
  label           TEXT NOT NULL,
  unit            TEXT,
  target_value    NUMERIC(18,4),
  actual_value    NUMERIC(18,4),
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- risks: manual risk register
CREATE TABLE risks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id),
  title           TEXT NOT NULL,
  description     TEXT,
  probability     TEXT NOT NULL DEFAULT 'medium' CHECK (probability IN ('low','medium','high')),
  impact          TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('low','medium','high','critical')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','mitigated','closed','accepted')),
  owner_id        UUID REFERENCES users(id),
  mitigation      TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- dependencies: project-to-project milestone dependencies
CREATE TABLE dependencies (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  to_project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_milestone_key TEXT,
  to_milestone_key   TEXT,
  org_id            UUID NOT NULL REFERENCES organizations(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_project_id <> to_project_id)
);

-- audit_events: immutable log of all mutations
CREATE TABLE audit_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  payload_before  JSONB,
  payload_after   JSONB,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_projects_workspace     ON projects(workspace_id);
CREATE INDEX idx_projects_org           ON projects(org_id);
CREATE INDEX idx_milestones_project     ON milestones(project_id);
CREATE INDEX idx_budget_periods_project ON budget_periods(project_id);
CREATE INDEX idx_kpis_workspace         ON kpis(workspace_id);
CREATE INDEX idx_kpis_recorded_at       ON kpis(recorded_at);
CREATE INDEX idx_audit_events_org       ON audit_events(org_id);
CREATE INDEX idx_audit_events_entity    ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_user      ON audit_events(user_id);
CREATE INDEX idx_org_members_org        ON org_members(org_id);
CREATE INDEX idx_org_members_user       ON org_members(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all mutable tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workspaces       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON programs         FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects         FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON milestones       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON budget_periods   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON risks            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
