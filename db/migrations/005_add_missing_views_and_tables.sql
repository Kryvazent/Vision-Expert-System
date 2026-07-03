-- =====================================================================
-- MIGRATION 005: Add missing views and tables referenced in frontend
--
-- This migration adds:
-- 1. branch_frame_stock view - Real-time per-branch frame counts
-- 2. branch_low_stock view - Products below threshold
-- 3. stock_movement_history table - Stock movement tracking
-- 4. damage_history table - Damage tracking
-- 5. Make frame.color nullable
-- =====================================================================

-- 1. Make frame.color nullable (from migration 002)
ALTER TABLE vision_expert.frame
  ALTER COLUMN color DROP NOT NULL;

-- 2. Create stock_movement_history table (from migration 003)
CREATE TABLE IF NOT EXISTS vision_expert.stock_movement_history (
  id BIGSERIAL PRIMARY KEY,
  reference_table TEXT NOT NULL,
  reference_id BIGINT NOT NULL,
  movement_type TEXT NOT NULL CHECK (
    movement_type IN (
      'allocation_requested',
      'allocation_approved',
      'allocation_rejected',
      'transfer_completed',
      'transfer_requested'
    )
  ),
  stock_id BIGINT NULL REFERENCES vision_expert.stock(id) ON DELETE SET NULL,
  frame_id BIGINT NULL REFERENCES vision_expert.frame(id) ON DELETE SET NULL,
  source_branch_id INT NULL REFERENCES vision_expert.branch(id) ON DELETE SET NULL,
  target_branch_id INT NULL REFERENCES vision_expert.branch(id) ON DELETE SET NULL,
  quantity BIGINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Pending Approval',
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_stock_movement_history UNIQUE (reference_table, reference_id, movement_type)
);

CREATE INDEX IF NOT EXISTS idx_stock_movement_history_stock_id
  ON vision_expert.stock_movement_history (stock_id);

CREATE INDEX IF NOT EXISTS idx_stock_movement_history_frame_id
  ON vision_expert.stock_movement_history (frame_id);

CREATE INDEX IF NOT EXISTS idx_stock_movement_history_target_branch_id
  ON vision_expert.stock_movement_history (target_branch_id);

CREATE INDEX IF NOT EXISTS idx_stock_movement_history_created_at
  ON vision_expert.stock_movement_history (created_at DESC);

-- 3. Create damage_history table (from migration 003)
CREATE TABLE IF NOT EXISTS vision_expert.damage_history (
  id BIGSERIAL PRIMARY KEY,
  reference_table TEXT NOT NULL DEFAULT 'damaged_stock',
  reference_id BIGINT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('damage_reported', 'damage_approved')),
  stock_id BIGINT NULL REFERENCES vision_expert.stock(id) ON DELETE SET NULL,
  branch_id INT NULL REFERENCES vision_expert.branch(id) ON DELETE SET NULL,
  quantity BIGINT NOT NULL DEFAULT 1,
  reason TEXT NULL,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by BIGINT NULL,
  approved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_damage_history UNIQUE (reference_table, reference_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_damage_history_stock_id
  ON vision_expert.damage_history (stock_id);

CREATE INDEX IF NOT EXISTS idx_damage_history_branch_id
  ON vision_expert.damage_history (branch_id);

CREATE INDEX IF NOT EXISTS idx_damage_history_created_at
  ON vision_expert.damage_history (created_at DESC);

-- 4. Create branch_frame_stock view
DROP VIEW IF EXISTS vision_expert.branch_low_stock;
DROP VIEW IF EXISTS vision_expert.branch_frame_stock;

CREATE VIEW vision_expert.branch_frame_stock AS
SELECT
  f.branch_id,
  f.product_id,
  p.name AS product_name,
  p.sku AS product_sku,
  ft.type AS frame_type,
  COUNT(*) FILTER (WHERE f.status = 'in_stock') AS in_stock_count,
  COUNT(*) FILTER (WHERE f.status = 'reserved') AS reserved_count,
  COUNT(*) FILTER (WHERE f.status = 'sold') AS sold_count,
  COUNT(*) FILTER (WHERE f.status = 'damaged') AS damaged_count,
  COUNT(*) FILTER (WHERE f.status = 'transferred') AS transferred_count
FROM vision_expert.frame f
JOIN vision_expert.product p ON f.product_id = p.id
JOIN vision_expert.frame_type ft ON f.frame_type_id = ft.id
GROUP BY f.branch_id, f.product_id, p.name, p.sku, ft.type;

-- 5. Create branch_low_stock view
CREATE VIEW vision_expert.branch_low_stock AS
SELECT
  s.branch_id,
  s.product_id,
  p.name AS product_name,
  p.sku AS product_sku,
  ft.type AS frame_type,
  COUNT(*) FILTER (WHERE f.status = 'in_stock') AS in_stock_count
FROM vision_expert.stock s
JOIN vision_expert.product p ON s.product_id = p.id
LEFT JOIN vision_expert.frame f ON f.product_id = p.id AND f.branch_id = s.branch_id AND f.status = 'in_stock'
LEFT JOIN vision_expert.frame_type ft ON f.frame_type_id = ft.id
WHERE s.available_quantity > 0 AND s.available_quantity <= 100
GROUP BY s.branch_id, s.product_id, p.name, p.sku, ft.type;

-- 6. Create triggers for stock_movement_history (from migration 003)
CREATE OR REPLACE FUNCTION vision_expert.log_stock_movement_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  source_branch INT;
  movement_kind TEXT;
BEGIN
  SELECT s.branch_id
    INTO source_branch
  FROM vision_expert.stock s
  WHERE s.id = NEW.stock_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO vision_expert.stock_movement_history (
      reference_table,
      reference_id,
      movement_type,
      stock_id,
      frame_id,
      source_branch_id,
      target_branch_id,
      quantity,
      status,
      notes
    ) VALUES (
      'stock_distribution',
      NEW.id,
      'allocation_requested',
      NEW.stock_id,
      NEW.frame_id,
      source_branch,
      NEW.branch_id,
      COALESCE(NEW.quantity, 1),
      COALESCE(NEW.status, 'Pending Approval'),
      NEW.notes
    )
    ON CONFLICT (reference_table, reference_id, movement_type) DO NOTHING;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    movement_kind := CASE
      WHEN NEW.status = 'Approved' THEN 'allocation_approved'
      WHEN NEW.status = 'Transferred' THEN 'transfer_completed'
      WHEN NEW.status = 'Rejected' THEN 'allocation_rejected'
      ELSE 'allocation_requested'
    END;

    INSERT INTO vision_expert.stock_movement_history (
      reference_table,
      reference_id,
      movement_type,
      stock_id,
      frame_id,
      source_branch_id,
      target_branch_id,
      quantity,
      status,
      notes
    ) VALUES (
      'stock_distribution',
      NEW.id,
      movement_kind,
      NEW.stock_id,
      NEW.frame_id,
      source_branch,
      NEW.branch_id,
      COALESCE(NEW.quantity, 1),
      COALESCE(NEW.status, 'Pending Approval'),
      NEW.notes
    )
    ON CONFLICT (reference_table, reference_id, movement_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_distribution_history ON vision_expert.stock_distribution;

CREATE TRIGGER trg_stock_distribution_history
AFTER INSERT OR UPDATE OF status
ON vision_expert.stock_distribution
FOR EACH ROW
EXECUTE FUNCTION vision_expert.log_stock_movement_history();

-- 7. Create triggers for damage_history (from migration 003)
CREATE OR REPLACE FUNCTION vision_expert.log_damage_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  source_branch INT;
BEGIN
  SELECT s.branch_id
    INTO source_branch
  FROM vision_expert.stock s
  WHERE s.id = NEW.stock_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO vision_expert.damage_history (
      reference_table,
      reference_id,
      event_type,
      stock_id,
      branch_id,
      quantity,
      reason,
      approved,
      approved_at
    ) VALUES (
      'damaged_stock',
      NEW.id,
      'damage_reported',
      NEW.stock_id,
      source_branch,
      COALESCE(NEW.damaged_quantity, 1),
      NEW.reason,
      COALESCE(NEW.status_bool, FALSE),
      CASE WHEN COALESCE(NEW.status_bool, FALSE) THEN NOW() ELSE NULL END
    )
    ON CONFLICT (reference_table, reference_id, event_type) DO NOTHING;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status_bool IS DISTINCT FROM OLD.status_bool THEN
    INSERT INTO vision_expert.damage_history (
      reference_table,
      reference_id,
      event_type,
      stock_id,
      branch_id,
      quantity,
      reason,
      approved,
      approved_at
    ) VALUES (
      'damaged_stock',
      NEW.id,
      CASE WHEN NEW.status_bool THEN 'damage_approved' ELSE 'damage_reported' END,
      NEW.stock_id,
      source_branch,
      COALESCE(NEW.damaged_quantity, 1),
      NEW.reason,
      COALESCE(NEW.status_bool, FALSE),
      CASE WHEN NEW.status_bool THEN NOW() ELSE NULL END
    )
    ON CONFLICT (reference_table, reference_id, event_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_damage_history ON vision_expert.damaged_stock;

CREATE TRIGGER trg_damage_history
AFTER INSERT OR UPDATE OF status_bool
ON vision_expert.damaged_stock
FOR EACH ROW
EXECUTE FUNCTION vision_expert.log_damage_history();

-- 8. Backfill existing data (from migration 003)
INSERT INTO vision_expert.stock_movement_history (
  reference_table,
  reference_id,
  movement_type,
  stock_id,
  frame_id,
  source_branch_id,
  target_branch_id,
  quantity,
  status,
  notes,
  created_at
)
SELECT
  'stock_distribution' AS reference_table,
  sd.id AS reference_id,
  'allocation_requested' AS movement_type,
  sd.stock_id,
  sd.frame_id,
  s.branch_id AS source_branch_id,
  sd.branch_id AS target_branch_id,
  COALESCE(sd.quantity, 1),
  COALESCE(sd.status, 'Pending Approval'),
  sd.notes,
  sd.created_at
FROM vision_expert.stock_distribution sd
LEFT JOIN vision_expert.stock s ON s.id = sd.stock_id
ON CONFLICT (reference_table, reference_id, movement_type) DO NOTHING;

INSERT INTO vision_expert.stock_movement_history (
  reference_table,
  reference_id,
  movement_type,
  stock_id,
  frame_id,
  source_branch_id,
  target_branch_id,
  quantity,
  status,
  notes,
  created_at
)
SELECT
  'stock_distribution' AS reference_table,
  sd.id AS reference_id,
  CASE
    WHEN sd.status = 'Approved' THEN 'allocation_approved'
    WHEN sd.status = 'Transferred' THEN 'transfer_completed'
    WHEN sd.status = 'Rejected' THEN 'allocation_rejected'
    ELSE 'allocation_requested'
  END AS movement_type,
  sd.stock_id,
  sd.frame_id,
  s.branch_id AS source_branch_id,
  sd.branch_id AS target_branch_id,
  COALESCE(sd.quantity, 1),
  COALESCE(sd.status, 'Pending Approval'),
  sd.notes,
  sd.created_at
FROM vision_expert.stock_distribution sd
LEFT JOIN vision_expert.stock s ON s.id = sd.stock_id
WHERE sd.status IS NOT NULL
  AND sd.status <> 'Pending Approval'
ON CONFLICT (reference_table, reference_id, movement_type) DO NOTHING;

INSERT INTO vision_expert.damage_history (
  reference_table,
  reference_id,
  event_type,
  stock_id,
  branch_id,
  quantity,
  reason,
  approved,
  approved_at,
  created_at
)
SELECT
  'damaged_stock' AS reference_table,
  ds.id AS reference_id,
  'damage_reported' AS event_type,
  ds.stock_id,
  s.branch_id AS branch_id,
  COALESCE(ds.damaged_quantity, 1),
  ds.reason,
  COALESCE(ds.status_bool, FALSE),
  CASE WHEN COALESCE(ds.status_bool, FALSE) THEN ds.created_at ELSE NULL END,
  ds.created_at
FROM vision_expert.damaged_stock ds
LEFT JOIN vision_expert.stock s ON s.id = ds.stock_id
ON CONFLICT (reference_table, reference_id, event_type) DO NOTHING;

INSERT INTO vision_expert.damage_history (
  reference_table,
  reference_id,
  event_type,
  stock_id,
  branch_id,
  quantity,
  reason,
  approved,
  approved_at,
  created_at
)
SELECT
  'damaged_stock' AS reference_table,
  ds.id AS reference_id,
  'damage_approved' AS event_type,
  ds.stock_id,
  s.branch_id AS branch_id,
  COALESCE(ds.damaged_quantity, 1),
  ds.reason,
  TRUE,
  COALESCE(ds.created_at, NOW()),
  COALESCE(ds.created_at, NOW())
FROM vision_expert.damaged_stock ds
LEFT JOIN vision_expert.stock s ON s.id = ds.stock_id
WHERE COALESCE(ds.status_bool, FALSE) = TRUE
ON CONFLICT (reference_table, reference_id, event_type) DO NOTHING;
