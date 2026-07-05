-- Migration 010: Add RLS Policies for cash_transfers_to_admin
-- This migration adds Row Level Security policies to allow admin role to access cash_transfers_to_admin table

-- =====================================================================
-- 1. Create PostgreSQL roles if they don't exist
-- =====================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE "admin";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sales-executive') THEN
        CREATE ROLE "sales-executive";
    END IF;
END
$$;

-- =====================================================================
-- 2. Enable Row Level Security on cash_transfers_to_admin table
-- =====================================================================

ALTER TABLE vision_expert.cash_transfers_to_admin
ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 3. Create policy for admin role to SELECT all cash transfers
-- =====================================================================

DROP POLICY IF EXISTS "admin_select_all_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "admin_select_all_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR SELECT
TO admin
USING (true);

-- =====================================================================
-- 4. Create policy for admin role to UPDATE all cash transfers
-- =====================================================================

DROP POLICY IF EXISTS "admin_update_all_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "admin_update_all_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR UPDATE
TO admin
USING (true);

-- =====================================================================
-- 5. Create policy for admin role to INSERT cash transfers
-- =====================================================================

DROP POLICY IF EXISTS "admin_insert_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "admin_insert_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR INSERT
TO admin
WITH CHECK (true);

-- =====================================================================
-- 6. Create policy for sales-executive to SELECT their own transfers
-- =====================================================================

DROP POLICY IF EXISTS "sales_executive_select_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "sales_executive_select_own_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR SELECT
TO "sales-executive"
USING (
  by IN (
    SELECT id FROM vision_expert.staff 
    WHERE auth_user_id = auth.uid()
  )
);

-- =====================================================================
-- 7. Create policy for sales-executive to UPDATE their own transfers
-- =====================================================================

DROP POLICY IF EXISTS "sales_executive_update_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "sales_executive_update_own_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR UPDATE
TO "sales-executive"
USING (
  by IN (
    SELECT id FROM vision_expert.staff 
    WHERE auth_user_id = auth.uid()
  )
);

-- =====================================================================
-- 8. Create policy for sales-executive to INSERT their own transfers
-- =====================================================================

DROP POLICY IF EXISTS "sales_executive_insert_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "sales_executive_insert_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR INSERT
TO "sales-executive"
WITH CHECK (
  by IN (
    SELECT id FROM vision_expert.staff 
    WHERE auth_user_id = auth.uid()
  )
);
