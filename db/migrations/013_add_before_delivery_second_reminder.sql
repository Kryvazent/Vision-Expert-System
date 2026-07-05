-- Add a second before-delivery reminder call result to the reminder_call table.

ALTER TABLE vision_expert.reminder_call
ADD COLUMN IF NOT EXISTS before_delivery_2_status TEXT;

ALTER TABLE vision_expert.reminder_call
ADD COLUMN IF NOT EXISTS before_delivery_2_reason TEXT;

ALTER TABLE vision_expert.reminder_call
ADD COLUMN IF NOT EXISTS before_delivery_2_custom_reason TEXT;
