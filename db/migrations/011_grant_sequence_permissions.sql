-- =====================================================================
-- MIGRATION 011: Grant sequence USAGE permissions to authenticated role
--
-- The stock_movement_history and damage_history tables use BIGSERIAL
-- (i.e. DEFAULT nextval('..._id_seq')). When a trigger fires on
-- INSERT/UPDATE of stock_distribution or damaged_stock, the trigger
-- function inserts into those tables on behalf of the calling user.
-- In Supabase the calling user is the `authenticated` role, which
-- needs USAGE + SELECT on the sequences to call nextval().
--
-- Without this, any role (manager, admin, sales-executive, etc.) that
-- mutates stock_distribution or damaged_stock gets:
--   "permission denied for sequence stock_movement_history_id_seq"
-- =====================================================================

GRANT USAGE, SELECT ON SEQUENCE vision_expert.stock_movement_history_id_seq
  TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE vision_expert.damage_history_id_seq
  TO authenticated;

-- Also ensure the authenticated role can INSERT into those tables
-- (the trigger runs as SECURITY DEFINER by default in pg_graphql
--  Supabase setups, but grant explicitly to be safe)
GRANT INSERT ON vision_expert.stock_movement_history TO authenticated;
GRANT INSERT ON vision_expert.damage_history TO authenticated;
