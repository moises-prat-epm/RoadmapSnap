DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'roadmapsnap_app') THEN
    CREATE ROLE roadmapsnap_app WITH LOGIN PASSWORD 'apppassword' NOSUPERUSER;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO roadmapsnap_app;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO roadmapsnap_app;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO roadmapsnap_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO roadmapsnap_app;

ALTER ROLE roadmapsnap_app SET row_security = on;
