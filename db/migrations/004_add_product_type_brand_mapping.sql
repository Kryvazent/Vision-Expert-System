-- =====================================================================
-- MIGRATION 004: Category-to-brand mapping for stock entry
--
-- This table lets the UI show only the brands allowed for a selected
-- product category, instead of relying on a heuristic filter.
-- =====================================================================

CREATE TABLE IF NOT EXISTS vision_expert.product_type_brand (
  id BIGSERIAL PRIMARY KEY,
  product_type_id BIGINT NOT NULL REFERENCES vision_expert.product_type(id) ON DELETE CASCADE,
  brand_id BIGINT NOT NULL REFERENCES vision_expert.brand(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_type_brand UNIQUE (product_type_id, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_product_type_brand_product_type_id
  ON vision_expert.product_type_brand (product_type_id);

CREATE INDEX IF NOT EXISTS idx_product_type_brand_brand_id
  ON vision_expert.product_type_brand (brand_id);

-- Seed example mappings below after replacing the ids with your real data.
-- INSERT INTO vision_expert.product_type_brand (product_type_id, brand_id)
-- VALUES
--   (1, 1),
--   (1, 2),
--   (2, 3)
-- ON CONFLICT (product_type_id, brand_id) DO NOTHING;