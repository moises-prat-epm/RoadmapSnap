ALTER TABLE users ADD COLUMN IF NOT EXISTS
  preferences JSONB NOT NULL DEFAULT '{"theme":"light"}';
