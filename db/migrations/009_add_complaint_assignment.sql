-- Migration 009: Complaint Assignment and Resolution
-- This migration adds:
-- 1. assigned_to field to complaint table for assigning to staff
-- 2. resolution_description field to capture complaint resolution details
-- 3. Additional complaint statuses for assignment workflow

-- =====================================================================
-- 1. Add assignment and resolution fields to complaint table
-- =====================================================================

ALTER TABLE vision_expert.complaint
ADD COLUMN IF NOT EXISTS assigned_to integer,
ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS resolution_description text,
ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

ALTER TABLE vision_expert.complaint
ADD CONSTRAINT complaint_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES vision_expert.staff(id);

CREATE INDEX idx_complaint_assigned_to ON vision_expert.complaint(assigned_to);
CREATE INDEX idx_complaint_complaint_status_id ON vision_expert.complaint(complaint_status_id);

-- =====================================================================
-- 2. Add additional complaint statuses for assignment workflow
-- =====================================================================

INSERT INTO vision_expert.complaint_status (status)
SELECT 'Assigned'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.complaint_status WHERE status = 'Assigned')
ON CONFLICT DO NOTHING;

INSERT INTO vision_expert.complaint_status (status)
SELECT 'In Progress'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.complaint_status WHERE status = 'In Progress')
ON CONFLICT DO NOTHING;

INSERT INTO vision_expert.complaint_status (status)
SELECT 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.complaint_status WHERE status = 'Pending')
ON CONFLICT DO NOTHING;

INSERT INTO vision_expert.complaint_status (status)
SELECT 'Resolved'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.complaint_status WHERE status = 'Resolved')
ON CONFLICT DO NOTHING;

INSERT INTO vision_expert.complaint_status (status)
SELECT 'Closed'
WHERE NOT EXISTS (SELECT 1 FROM vision_expert.complaint_status WHERE status = 'Closed')
ON CONFLICT DO NOTHING;
