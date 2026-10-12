-- 003_site_content_page_default.sql
-- OPTIONAL safety net — changes NO existing rows or data.
--
-- The app writes CMS documents to site_content keyed by `key`:
--   upsert { key, value, updated_at, updated_by }   (value is JSON-encoded)
-- and reads with: select key, value.
--
-- If your `page` column is NOT NULL without a default, those inserts fail.
-- Giving it a default makes every insert legal without touching existing
-- rows. Apply ONLY if admin content saves / doc upserts error with a
-- NOT NULL violation on `page`; skip it otherwise.

ALTER TABLE site_content ALTER COLUMN page SET DEFAULT 'site';
