-- Migration 015: Disable RLS on cash_transfers_to_admin table
-- This migration removes Row Level Security policies and disables RLS
-- to allow application-level filtering to handle data access control

-- =====================================================================
-- 1. Drop all existing policies on cash_transfers_to_admin
-- =====================================================================

DROP POLICY IF EXISTS "admin_select_all_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "admin_update_all_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "admin_insert_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "sales_executive_select_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "sales_executive_update_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "sales_executive_insert_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "recovery_officer_select_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "recovery_officer_update_own_cash_transfers" ON vision_expert.cash_transfers_to_admin;
DROP POLICY IF EXISTS "recovery_officer_insert_cash_transfers" ON vision_expert.cash_transfers_to_admin;

-- =====================================================================
-- 2. Disable Row Level Security on cash_transfers_to_admin table
-- =====================================================================

ALTER TABLE vision_expert.cash_transfers_to_admin
DISABLE ROW LEVEL SECURITY;
