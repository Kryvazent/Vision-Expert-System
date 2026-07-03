-- Migration 008: Petty Cash Request System
-- This migration adds:
-- 1. petty_cash_request table for admin to request petty cash from owner
-- 2. petty_cash_allocation table for owner to allocate petty cash to branches

-- =====================================================================
-- 1. Create petty cash request table
-- =====================================================================

CREATE TABLE IF NOT EXISTS vision_expert.petty_cash_request (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  requested_by bigint NOT NULL,
  branch_id integer NOT NULL,
  amount double precision NOT NULL,
  reason text,
  request_status character varying NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  reviewed_at timestamp with time zone,
  reviewed_by bigint,
  rejection_reason text,
  CONSTRAINT petty_cash_request_pkey PRIMARY KEY (id),
  CONSTRAINT petty_cash_request_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT petty_cash_request_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id),
  CONSTRAINT petty_cash_request_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES vision_expert.staff(id)
);

CREATE INDEX idx_petty_cash_request_branch_id ON vision_expert.petty_cash_request(branch_id);
CREATE INDEX idx_petty_cash_request_status ON vision_expert.petty_cash_request(request_status);
CREATE INDEX idx_petty_cash_request_created_at ON vision_expert.petty_cash_request(created_at DESC);

-- =====================================================================
-- 2. Create petty cash allocation table
-- =====================================================================

CREATE TABLE IF NOT EXISTS vision_expert.petty_cash_allocation (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  allocated_by bigint NOT NULL,
  branch_id integer NOT NULL,
  amount double precision NOT NULL,
  notes text,
  month integer NOT NULL,
  year integer NOT NULL,
  CONSTRAINT petty_cash_allocation_pkey PRIMARY KEY (id),
  CONSTRAINT petty_cash_allocation_allocated_by_fkey FOREIGN KEY (allocated_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT petty_cash_allocation_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);

CREATE INDEX idx_petty_cash_allocation_branch_id ON vision_expert.petty_cash_allocation(branch_id);
CREATE INDEX idx_petty_cash_allocation_month_year ON vision_expert.petty_cash_allocation(month, year);
CREATE INDEX idx_petty_cash_allocation_created_at ON vision_expert.petty_cash_allocation(created_at DESC);

-- =====================================================================
-- 3. Add foreign key to petty_cash table to link to allocation
-- =====================================================================

ALTER TABLE vision_expert.petty_cash
ADD COLUMN IF NOT EXISTS allocation_id bigint;

ALTER TABLE vision_expert.petty_cash
ADD CONSTRAINT petty_cash_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES vision_expert.petty_cash_allocation(id);

CREATE INDEX idx_petty_cash_allocation_id ON vision_expert.petty_cash(allocation_id);
