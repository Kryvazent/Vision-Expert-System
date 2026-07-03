-- =====================================================================
-- MIGRATION 002: Make frame.color nullable
--
-- The UI allows adding frames without specifying a color (it's optional
-- aesthetic data). The original schema had color NOT NULL, which would
-- reject inserts where color is omitted.
-- =====================================================================

ALTER TABLE vision_expert.frame
  ALTER COLUMN color DROP NOT NULL;

-- Optional: set a consistent empty-string default so existing queries
-- that expect a non-null string still work without code changes.
-- Remove or adjust this if you prefer pure NULLs.
-- ALTER TABLE vision_expert.frame
--   ALTER COLUMN color SET DEFAULT '';
