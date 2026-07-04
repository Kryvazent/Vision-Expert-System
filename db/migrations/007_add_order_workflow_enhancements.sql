-- Migration 007: Order Workflow Enhancements
-- This migration adds:
-- 1. Missing order statuses for the complete order workflow
-- 2. Box and cleaning cloth as product types
-- 3. Order payment table for tracking partial payments
-- 4. Updated low stock threshold to 200 items

-- =====================================================================
-- 1. Add missing order statuses
-- =====================================================================

INSERT INTO vision_expert.order_status (status, deesc)
SELECT 'Hold', 'Order placed without advance payment - awaiting payment to proceed'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.order_status WHERE status = 'Hold');

INSERT INTO vision_expert.order_status (status, deesc)
SELECT 'Cancelled', 'Order cancelled by customer or admin'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.order_status WHERE status = 'Cancelled');

INSERT INTO vision_expert.order_status (status, deesc)
SELECT 'Confirmed', 'Order confirmed by admin after customer call'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.order_status WHERE status = 'Confirmed');

INSERT INTO vision_expert.order_status (status, deesc)
SELECT 'In Lab', 'Order sent to lab for processing'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.order_status WHERE status = 'In Lab');

INSERT INTO vision_expert.order_status (status, deesc)
SELECT 'Ready for Delivery', 'Order received from lab and ready for delivery'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.order_status WHERE status = 'Ready for Delivery');

INSERT INTO vision_expert.order_status (status, deesc)
SELECT 'Delivered', 'Order delivered to customer'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.order_status WHERE status = 'Delivered');

-- =====================================================================
-- 2. Add box and cleaning cloth as product types
-- =====================================================================

-- First, add product types if they don't exist
INSERT INTO vision_expert.product_type (type)
SELECT 'Box'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.product_type WHERE type = 'Box');

INSERT INTO vision_expert.product_type (type)
SELECT 'Cleaning Cloth'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.product_type WHERE type = 'Cleaning Cloth');

-- =====================================================================
-- 3. Create order_payment table for tracking partial payments per order
-- =====================================================================

CREATE TABLE IF NOT EXISTS vision_expert.order_payment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id bigint NOT NULL,
  amount double precision NOT NULL,
  payment_method character varying NOT NULL,
  payment_type character varying NOT NULL, -- 'advance', 'partial', 'full', 'balance'
  notes text,
  received_by bigint NOT NULL,
  cash_transfer_id bigint, -- Link to cash workflow if applicable
  CONSTRAINT order_payment_pkey PRIMARY KEY (id),
  CONSTRAINT order_payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id) ON DELETE CASCADE,
  CONSTRAINT order_payment_received_by_fkey FOREIGN KEY (received_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT order_payment_cash_transfer_id_fkey FOREIGN KEY (cash_transfer_id) REFERENCES vision_expert.cash_transfers_to_admin(id)
);

CREATE INDEX idx_order_payment_order_id ON vision_expert.order_payment(order_id);
CREATE INDEX idx_order_payment_created_at ON vision_expert.order_payment(created_at DESC);

-- =====================================================================
-- 4. Update branch_low_stock view to use 200 items threshold
-- =====================================================================

DROP VIEW IF EXISTS vision_expert.branch_low_stock;

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
WHERE s.available_quantity > 0 AND s.available_quantity <= 200
GROUP BY s.branch_id, s.product_id, p.name, p.sku, ft.type;

-- =====================================================================
-- 5. Add columns to order table for workflow tracking
-- =====================================================================

ALTER TABLE vision_expert.order
ADD COLUMN IF NOT EXISTS customer_confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS customer_confirmed_by bigint,
ADD COLUMN IF NOT EXISTS sent_to_lab_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS received_from_lab_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS first_reminder_call_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS second_reminder_call_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_by bigint,
ADD COLUMN IF NOT EXISTS balance_amount double precision DEFAULT 0;

ALTER TABLE vision_expert.order
ADD CONSTRAINT order_customer_confirmed_by_fkey FOREIGN KEY (customer_confirmed_by) REFERENCES vision_expert.staff(id),
ADD CONSTRAINT order_delivered_by_fkey FOREIGN KEY (delivered_by) REFERENCES vision_expert.staff(id);

-- =====================================================================
-- 6. Add intended date columns for tracking planned vs actual dates
-- =====================================================================

ALTER TABLE vision_expert.order
ADD COLUMN IF NOT EXISTS intended_customer_confirm_date date,
ADD COLUMN IF NOT EXISTS intended_send_to_lab_date date,
ADD COLUMN IF NOT EXISTS intended_receive_from_lab_date date,
ADD COLUMN IF NOT EXISTS intended_first_reminder_date date,
ADD COLUMN IF NOT EXISTS intended_second_reminder_date date,
ADD COLUMN IF NOT EXISTS intended_delivery_date date;
