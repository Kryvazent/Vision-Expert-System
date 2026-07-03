-- Add rejection_reason column to cash_transfers_to_admin table
-- This allows admin and manager to provide reasons when rejecting cash transfers

ALTER TABLE vision_expert.cash_transfers_to_admin
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
