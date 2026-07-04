-- Migration 010: Add RLS Policies for cash_transfers_to_admin
-- This migration adds Row Level Security policies to allow admin role to access cash_transfers_to_admin table

-- =====================================================================
-- 1. Enable Row Level Security on cash_transfers_to_admin table
-- =====================================================================

ALTER TABLE vision_expert.cash_transfers_to_admin
ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. Create policy for admin role to SELECT all cash transfers
-- =====================================================================

CREATE POLICY "admin_select_all_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR SELECT
TO admin
USING (true);

-- =====================================================================
-- 3. Create policy for admin role to UPDATE all cash transfers
-- =====================================================================

CREATE POLICY "admin_update_all_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR UPDATE
TO admin
USING (true);

-- =====================================================================
-- 4. Create policy for admin role to INSERT cash transfers
-- =====================================================================

CREATE POLICY "admin_insert_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR INSERT
TO admin
WITH CHECK (true);

-- =====================================================================
-- 5. Create policy for sales-executive to SELECT their own transfers
-- =====================================================================

CREATE POLICY "sales_executive_select_own_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR SELECT
TO sales-executive
USING (by = current_setting('request.jwt.claim.user_id')::integer);

-- =====================================================================
-- 6. Create policy for sales-executive to UPDATE their own transfers
-- =====================================================================

CREATE POLICY "sales_executive_update_own_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR UPDATE
TO sales-executive
USING (by = current_setting('request.jwt.claim.user_id')::integer);

-- =====================================================================
-- 7. Create policy for sales-executive to INSERT their own transfers
-- =====================================================================

CREATE POLICY "sales_executive_insert_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR INSERT
TO sales-executive
WITH CHECK (by = current_setting('request.jwt.claim.user_id')::integer);
