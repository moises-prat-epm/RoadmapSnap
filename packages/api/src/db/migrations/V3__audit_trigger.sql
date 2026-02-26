-- Automatic audit trail: any INSERT/UPDATE/DELETE on tracked tables
-- writes a row to audit_events automatically

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  -- Get org_id from the row being changed
  IF TG_OP = 'DELETE' THEN
    v_org_id := OLD.org_id;
  ELSE
    v_org_id := NEW.org_id;
  END IF;

  -- Get current user from session variable (set by API per request)
  BEGIN
    v_user_id := current_setting('app.current_user_id', true)::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  INSERT INTO audit_events (
    org_id,
    user_id,
    action,
    entity_type,
    entity_id,
    payload_before,
    payload_after,
    metadata
  ) VALUES (
    v_org_id,
    v_user_id,
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    jsonb_build_object('table', TG_TABLE_NAME, 'schema', TG_TABLE_SCHEMA)
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all mutable domain tables
CREATE TRIGGER audit_projects     AFTER INSERT OR UPDATE OR DELETE ON projects      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_milestones   AFTER INSERT OR UPDATE OR DELETE ON milestones    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_budget       AFTER INSERT OR UPDATE OR DELETE ON budget_periods FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_risks        AFTER INSERT OR UPDATE OR DELETE ON risks          FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_workspaces   AFTER INSERT OR UPDATE OR DELETE ON workspaces     FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_org_members  AFTER INSERT OR UPDATE OR DELETE ON org_members   FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
