-- Add an explicit owner review state for damaged stock requests.
-- Before this, damaged_stock.status_bool could only represent pending/approved.

ALTER TABLE vision_expert.damaged_stock
ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'Pending';

ALTER TABLE vision_expert.damaged_stock
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE vision_expert.damaged_stock
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER NULL REFERENCES vision_expert.staff(id);

ALTER TABLE vision_expert.damaged_stock
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL;

UPDATE vision_expert.damaged_stock
SET review_status = CASE WHEN status_bool THEN 'Approved' ELSE 'Pending' END
WHERE review_status IS NULL OR review_status = 'Pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'damaged_stock_review_status_check'
      AND conrelid = 'vision_expert.damaged_stock'::regclass
  ) THEN
    ALTER TABLE vision_expert.damaged_stock
    ADD CONSTRAINT damaged_stock_review_status_check
    CHECK (review_status IN ('Pending', 'Approved', 'Rejected'));
  END IF;
END $$;

ALTER TABLE vision_expert.damage_history
DROP CONSTRAINT IF EXISTS damage_history_event_type_check;

ALTER TABLE vision_expert.damage_history
ADD CONSTRAINT damage_history_event_type_check
CHECK (event_type IN ('damage_reported', 'damage_approved', 'damage_rejected'));

CREATE OR REPLACE FUNCTION vision_expert.log_damage_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  source_branch INT;
  source_stock_id BIGINT;
  source_quantity BIGINT;
  source_reason TEXT;
  history_event TEXT;
BEGIN
  source_stock_id := COALESCE(NEW.stock_id, OLD.stock_id);
  source_quantity := COALESCE(NEW.damaged_quantity, OLD.damaged_quantity);
  source_reason := COALESCE(NEW.rejection_reason, NEW.reason, OLD.reason);

  SELECT s.branch_id
    INTO source_branch
  FROM vision_expert.stock s
  WHERE s.id = source_stock_id;

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
    )
    VALUES (
      'damaged_stock',
      NEW.id,
      'damage_reported',
      NEW.stock_id,
      source_branch,
      NEW.damaged_quantity,
      NEW.reason,
      FALSE,
      NULL
    )
    ON CONFLICT ON CONSTRAINT uq_damage_history DO NOTHING;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.review_status = OLD.review_status THEN
      RETURN NEW;
    END IF;

    history_event := CASE
      WHEN NEW.review_status = 'Approved' THEN 'damage_approved'
      WHEN NEW.review_status = 'Rejected' THEN 'damage_rejected'
      ELSE NULL
    END;

    IF history_event IS NULL THEN
      RETURN NEW;
    END IF;

    INSERT INTO vision_expert.damage_history (
      reference_table,
      reference_id,
      event_type,
      stock_id,
      branch_id,
      quantity,
      reason,
      approved,
      approved_by,
      approved_at
    )
    VALUES (
      'damaged_stock',
      NEW.id,
      history_event,
      source_stock_id,
      source_branch,
      source_quantity,
      source_reason,
      NEW.review_status = 'Approved',
      NEW.reviewed_by,
      NEW.reviewed_at
    )
    ON CONFLICT ON CONSTRAINT uq_damage_history DO NOTHING;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;
