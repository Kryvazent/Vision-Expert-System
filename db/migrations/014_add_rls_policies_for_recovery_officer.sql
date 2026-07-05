-- Migration 014: Add RLS Policies for recovery-officer on cash_transfers_to_admin
-- This migration adds Row Level Security policies to allow recovery-officer role to access cash_transfers_to_admin table

-- =====================================================================
-- 1. Create the recovery-officer PostgreSQL role if it doesn't exist
-- =====================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'recovery-officer') THEN
        CREATE ROLE "recovery-officer";
    END IF;
END
$$;

-- =====================================================================
-- 2. Create policy for recovery-officer to SELECT their own transfers
-- =====================================================================

DROP POLICY IF EXISTS "recovery_officer_select_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "recovery_officer_select_own_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR SELECT
TO "recovery-officer"
USING (by = current_setting('request.jwt.claim.user_id')::integer);

-- =====================================================================
-- 3. Create policy for recovery-officer to UPDATE their own transfers
-- =====================================================================

DROP POLICY IF EXISTS "recovery_officer_update_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "recovery_officer_update_own_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR UPDATE
TO "recovery-officer"
USING (by = current_setting('request.jwt.claim.user_id')::integer);

-- =====================================================================
-- 4. Create policy for recovery-officer to INSERT their own transfers
-- =====================================================================

DROP POLICY IF EXISTS "recovery_officer_insert_cash_transfers" ON vision_expert.cash_transfers_to_admin;
CREATE POLICY "recovery_officer_insert_cash_transfers"
ON vision_expert.cash_transfers_to_admin
FOR INSERT
TO "recovery-officer"
WITH CHECK (by = current_setting('request.jwt.claim.user_id')::integer);
