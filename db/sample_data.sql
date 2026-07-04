-- Sample Data for Vision Expert System Database
-- This file contains INSERT statements for all tables with sample data
-- Execute in order to respect foreign key dependencies

-- ── Base Tables (No Dependencies) ───────────────────────────────────────────────

-- Role
INSERT INTO vision_expert.role (role_name) VALUES 
('Admin'),
('Manager'),
('Sales Executive'),
('Recovery Officer'),
('Administrative Officer'),
('Owner');

-- Branch
INSERT INTO vision_expert.branch (email, address, is_active, branch_name, revenue_target, order_target) VALUES 
('colombo@visionexpert.com', '123 Main Street, Colombo', true, 'Colombo Branch', 500000.00, 100),
('kandy@visionexpert.com', '456 Temple Road, Kandy', true, 'Kandy Branch', 300000.00, 75),
('galle@visionexpert.com', '789 Beach Road, Galle', true, 'Galle Branch', 250000.00, 60);

-- Clinic Status
INSERT INTO vision_expert.clinic_status (status) VALUES 
('Scheduled'),
('In Progress'),
('Completed'),
('Cancelled');

-- Order Status
INSERT INTO vision_expert.order_status (status, deesc) VALUES 
('Pending', 'Order placed, awaiting confirmation'),
('Confirmed', 'Order confirmed by customer'),
('Sent to Lab', 'Order sent to lab for processing'),
('Received from Lab', 'Order received from lab'),
('Ready for Delivery', 'Order ready for delivery'),
('Delivered', 'Order delivered to customer'),
('Cancelled', 'Order cancelled');

-- Complaint Status
INSERT INTO vision_expert.complaint_status (status) VALUES 
('Pending'),
('Assigned'),
('In Progress'),
('Resolved'),
('Closed');

-- Lab Follow Up Status
INSERT INTO vision_expert.lab_follow_up_status (status) VALUES 
('Sent to Lab'),
('In Progress'),
('Received from Lab'),
('Delivered');

-- Cash Transfer Status
INSERT INTO vision_expert.cash_transfer_status (status) VALUES 
('Pending'),
('Approved'),
('Rejected'),
('Completed');

-- Cash Type
INSERT INTO vision_expert.cash_type (type) VALUES 
('Cash'),
('Cheque'),
('Bank Transfer');

-- Product Type
INSERT INTO vision_expert.product_type (type) VALUES 
('Frame'),
('Lens'),
('Accessories'),
('Contact Lens');

-- Brand
INSERT INTO vision_expert.brand (brand) VALUES 
('Ray-Ban'),
('Oakley'),
('Essilor'),
('Zeiss'),
('Hoya'),
('Varilux');

-- Product Type Brand
INSERT INTO vision_expert.product_type_brand (product_type_id, brand_id) VALUES 
(1, 1), -- Frame - Ray-Ban
(1, 2), -- Frame - Oakley
(2, 3), -- Lens - Essilor
(2, 4), -- Lens - Zeiss
(2, 5); -- Lens - Hoya

-- Frame Type
INSERT INTO vision_expert.frame_type (type) VALUES 
('Full Rim'),
('Half Rim'),
('Rimless'),
('Cat Eye'),
('Round'),
('Square'),
('Aviator');

-- Lense Type
INSERT INTO vision_expert.lense_type (type, price) VALUES 
('Single Vision', 5000.00),
('Bifocal', 8000.00),
('Progressive', 15000.00),
('Reading', 3000.00);

-- Supplier
INSERT INTO vision_expert.supplier (name, contact_no, email, address, is_active) VALUES 
('Vision Supplies Ltd', '+94 11 2345678', 'sales@visionsupplies.com', '45 Industrial Estate, Colombo', true),
('Optical World', '+94 11 3456789', 'info@opticalworld.com', '78 Business Park, Colombo', true),
('Lens Masters', '+94 11 4567890', 'orders@lensmasters.com', '123 Tech Zone, Colombo', true);

-- Customer
INSERT INTO vision_expert.customer (first_name, last_name, contact_no, address, dob, nic) VALUES 
('John', 'Doe', '+94 77 1234567', '123 Flower Road, Colombo 07', '1985-05-15', '851234567V'),
('Jane', 'Smith', '+94 77 2345678', '456 Lake Road, Kandy', '1990-08-20', '902345678V'),
('Robert', 'Johnson', '+94 77 3456789', '789 Hill Street, Galle', '1988-03-10', '883456789V'),
('Emily', 'Brown', '+94 77 4567890', '321 Sea View, Colombo 05', '1992-12-25', '924567890V'),
('Michael', 'Davis', '+94 77 5678901', '654 Garden Road, Kandy', '1987-07-30', '875678901V');

-- Customer Has Branch
INSERT INTO vision_expert.customer_has_branch (customer_id, branch_id) VALUES 
(1, 1), -- John Doe - Colombo
(2, 2), -- Jane Smith - Kandy
(3, 3), -- Robert Johnson - Galle
(4, 1), -- Emily Brown - Colombo
(5, 2); -- Michael Davis - Kandy

-- Staff (depends on role, branch)
INSERT INTO vision_expert.staff (first_name, last_name, nic, branch_id, role_id, is_active, email) VALUES 
('Admin', 'User', '901234567V', 1, 1, true, 'admin@visionexpert.com'),
('Manager', 'One', '912345678V', 1, 2, true, 'manager1@visionexpert.com'),
('Manager', 'Two', '923456789V', 2, 2, true, 'manager2@visionexpert.com'),
('Sales', 'Executive1', '934567890V', 1, 3, true, 'sales1@visionexpert.com'),
('Sales', 'Executive2', '945678901V', 2, 3, true, 'sales2@visionexpert.com'),
('Recovery', 'Officer1', '956789012V', 1, 4, true, 'recovery1@visionexpert.com'),
('Recovery', 'Officer2', '967890123V', 2, 4, true, 'recovery2@visionexpert.com'),
('Admin', 'Officer1', '978901234V', 1, 5, true, 'adminofficer1@visionexpert.com'),
('Owner', 'User', '989012345V', 1, 6, true, 'owner@visionexpert.com');

-- Project (depends on branch)
INSERT INTO vision_expert.project (branch_id, project_name, description, is_active, start_date) VALUES 
(1, 'Colombo Vision Camp 2024', 'Annual vision screening camp in Colombo', true, '2024-01-15'),
(2, 'Kandy Eye Care Initiative', 'Community eye care program in Kandy', true, '2024-02-01'),
(3, 'Galle Coastal Vision', 'Vision screening for coastal communities', true, '2024-03-01');

-- Clinic (depends on project, clinic_status, branch)
INSERT INTO vision_expert.clinic (venue, "from", "to", project_id, date, responsible_person_01, responsible_person_02, responsible_person_01_contact_no, responsible_person_02_contact_no, clinic_status_id, branch_id) VALUES 
('Colombo City Hall', '09:00:00', '17:00:00', 1, '2024-01-20', 'Manager One', 'Sales Executive1', '+94 77 1111111', '+94 77 2222222', 1, 1),
('Kandy Hospital', '08:30:00', '16:30:00', 2, '2024-02-05', 'Manager Two', 'Sales Executive2', '+94 77 3333333', '+94 77 4444444', 1, 2),
('Galle Community Center', '10:00:00', '18:00:00', 3, '2024-03-10', 'Manager One', 'Sales Executive1', '+94 77 5555555', '+94 77 6666666', 1, 3);

-- Equipment (depends on branch)
INSERT INTO vision_expert.equipment (name, reference_no, branch_id) VALUES 
('Auto Refractometer', 'EQ-001', 1),
('Slit Lamp', 'EQ-002', 1),
('Phoropter', 'EQ-003', 2),
('Tonometer', 'EQ-004', 2),
('Lensometer', 'EQ-005', 3);

-- Product (depends on product_type, brand, supplier)
INSERT INTO vision_expert.product (name, product_type_id, brand_id, purchase_price, selling_price, purchased_quantity, warranty_in_months, supplier_id, sku) VALUES 
('Aviator Classic', 1, 1, 15000.00, 25000.00, 50, 12, 1, 'RB-AVI-001'),
('Wayfarer', 1, 1, 18000.00, 30000.00, 40, 12, 1, 'RB-WAY-002'),
('Holbrook', 1, 2, 20000.00, 35000.00, 30, 12, 2, 'OK-HOL-001'),
('Single Vision Lens', 2, 3, 2000.00, 5000.00, 200, 24, 3, 'ES-SV-001'),
('Progressive Lens', 2, 4, 5000.00, 15000.00, 100, 24, 3, 'ZE-PR-001');

-- Frame (depends on frame_type, product, branch)
INSERT INTO vision_expert.frame (color, serial_no, frame_type_id, product_id, branch_id, status) VALUES 
('Black', 'FR-001', 1, 1, 1, 'in_stock'),
('Brown', 'FR-002', 1, 1, 1, 'in_stock'),
('Silver', 'FR-003', 2, 2, 2, 'in_stock'),
('Gold', 'FR-004', 3, 3, 2, 'in_stock'),
('Tortoise', 'FR-005', 4, 1, 3, 'in_stock');

-- Stock (depends on product, branch, staff, supplier)
INSERT INTO vision_expert.stock (product_id, available_quantity, branch_id, added_by, supplier_id) VALUES 
(1, 45, 1, 4, 1),
(2, 35, 1, 4, 1),
(3, 25, 2, 5, 2),
(4, 180, 2, 5, 3),
(5, 90, 3, 4, 3);

-- Clinic Staff (depends on clinic, staff)
INSERT INTO vision_expert.clinic_staff (clinic_id, staff_id) VALUES 
(1, 4),
(1, 6),
(2, 5),
(2, 7),
(3, 4),
(3, 6);

-- Clinic Has Equipment (depends on clinic, equipment, staff)
INSERT INTO vision_expert.clinic_has_equipment (clinic_id, equipment_id, allocated_by) VALUES 
(1, 1, 2),
(1, 2, 2),
(2, 3, 3),
(2, 4, 3),
(3, 5, 2);

-- Clinic Attend Customer (depends on customer_has_branch, clinic)
INSERT INTO vision_expert.clinic_attend_customer (customer_has_branch_id, clinic_id) VALUES 
(1, 1),
(2, 2),
(3, 3),
(4, 1),
(5, 2);

-- Prescription (depends on clinic_attend_customer)
INSERT INTO vision_expert.prescription (remarks, clinic_attend_customer_id, right_sph, right_cyl, right_axis, left_sph, left_cyl, left_axis, right_add, left_add, pupillary_distance) VALUES 
('Mild myopia', 1, -2.50, -0.50, 180, -2.75, -0.75, 175, 1.00, 1.00, 32),
('Hypermetropia', 2, +1.50, +0.50, 90, +1.75, +0.75, 85, 1.50, 1.50, 30),
('Astigmatism', 3, -3.00, -1.50, 45, -3.25, -1.75, 40, 0.00, 0.00, 33),
('Presbyopia', 4, +2.00, +0.75, 95, +2.25, +1.00, 100, 2.00, 2.00, 31),
('Normal vision', 5, 0.00, 0.00, 0, 0.00, 0.00, 0, 0.00, 0.00, 34);

-- Order (depends on order_status, clinic_attend_customer, prescription, lense_type, frame_type, frame)
INSERT INTO vision_expert.order (placed_at, agrahara_applied, estimated_delivery, remarks, order_status_id, clinic_attend_customer_id, prescription_id, lens_type_id, frame_type_id, frame_id, total_price, frame_warranty_month, lense_warranty_month, intended_delivery_date) VALUES 
('2024-01-21 10:00:00', false, '2024-01-31 10:00:00', 'Urgent delivery requested', 2, 1, 1, 1, 1, 1, 30000.00, 12, 24, '2024-01-31'),
('2024-02-06 09:00:00', false, '2024-02-16 09:00:00', 'Customer prefers specific frame color', 2, 2, 2, 2, 2, 3, 50000.00, 12, 24, '2024-02-16'),
('2024-03-11 11:00:00', false, '2024-03-21 11:00:00', 'Gift order', 2, 3, 3, 1, 3, 4, 35000.00, 12, 24, '2024-03-21'),
('2024-01-22 14:00:00', false, '2024-02-01 14:00:00', 'Reading glasses', 2, 4, 4, 4, 1, 2, 35000.00, 12, 24, '2024-02-01'),
('2024-02-07 15:00:00', false, '2024-02-17 15:00:00', 'Progressive lenses', 2, 5, 5, 3, 2, 3, 50000.00, 12, 24, '2024-02-17');

-- Payment (depends on order)
INSERT INTO vision_expert.payment (total_payment, remarks, order_id, discount, additional_fee, advance, discount_approved) VALUES 
(30000.00, 'Full payment', 1, 0.00, 0.00, 10000.00, false),
(50000.00, 'Full payment', 2, 5000.00, 0.00, 15000.00, true),
(35000.00, 'Full payment', 3, 0.00, 2000.00, 10000.00, false),
(35000.00, 'Full payment', 4, 0.00, 0.00, 5000.00, false),
(50000.00, 'Full payment', 5, 0.00, 0.00, 20000.00, false);

-- Order Status History (depends on order, order_status)
INSERT INTO vision_expert.order_status_history (order_id, order_statsu_id) VALUES 
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(3, 1),
(3, 2),
(4, 1),
(4, 2),
(5, 1),
(5, 2);

-- Discount Verified (depends on payment)
INSERT INTO vision_expert.discount_verified (verified, payment_id) VALUES 
(true, 2);

-- Order Payment (depends on order, staff)
INSERT INTO vision_expert.order_payment (order_id, amount, payment_method, payment_type, notes, received_by) VALUES 
(1, 20000.00, 'Cash', 'Balance', 'Remaining payment', 4),
(2, 30000.00, 'Card', 'Balance', 'Remaining payment', 5),
(3, 25000.00, 'Cash', 'Balance', 'Remaining payment', 4),
(4, 30000.00, 'Card', 'Balance', 'Remaining payment', 5),
(5, 30000.00, 'Cash', 'Balance', 'Remaining payment', 4);

-- Complaint (depends on order, complaint_status, staff)
INSERT INTO vision_expert.complaint (order_id, complaint, complaint_status_id, assigned_to, assigned_at, resolution_description, resolved_at) VALUES 
(1, 'Frame color different from ordered', 1, 6, '2024-01-25 10:00:00', 'Replaced with correct color', '2024-01-26 10:00:00'),
(2, 'Delivery delayed', 2, 7, '2024-02-18 09:00:00', NULL, NULL);

-- Lab Follow Up (depends on order, clinic, lab_follow_up_status, branch)
INSERT INTO vision_expert.lab_follow_up (order_id, clinic_id, sent_to_lab_date, expected_return_date, received_date, note, lab_follow_up_status_id, branch_id) VALUES 
(1, 1, '2024-01-23', '2024-01-30', '2024-01-29', 'Quality check passed', 3, 1),
(2, 2, '2024-02-08', '2024-02-15', '2024-02-14', 'Minor adjustments needed', 3, 2),
(3, 3, '2024-03-13', '2024-03-20', NULL, 'In progress', 2, 3),
(4, 1, '2024-01-24', '2024-01-31', '2024-01-30', 'Ready', 3, 1),
(5, 2, '2024-02-09', '2024-02-16', NULL, 'Processing', 2, 2);

-- Delivery Order (depends on order, staff)
INSERT INTO vision_expert.delivery_order (order_id, delivered_by, payment_received, payment_type, paid_amount, balance_amount, status) VALUES 
(1, 6, true, 'full', 30000.00, 0.00, 'Delivered'),
(2, 7, true, 'full', 45000.00, 0.00, 'Delivered'),
(3, 6, false, 'partial', 10000.00, 25000.00, 'Not Delivered'),
(4, 7, true, 'full', 35000.00, 0.00, 'Delivered'),
(5, 6, false, 'partial', 20000.00, 30000.00, 'Not Delivered');

-- Cash Transfers to Admin (depends on staff, cash_transfer_status, cash_type, branch)
INSERT INTO vision_expert.cash_transfers_to_admin ("by", amount, cash_transfer_status_id, note, cash_type_id, branch_id, manager_proof_status, admin_proof_status, bank_deposit) VALUES 
(4, 50000.00, 2, 'Daily cash transfer', 1, 1, 'Approved', 'Approved', false),
(5, 75000.00, 2, 'Weekly cash transfer', 1, 2, 'Approved', 'Approved', false),
(6, 30000.00, 1, 'Pending transfer', 1, 3, 'Awaiting', 'Awaiting', false);

-- Petty Cash Request (depends on staff, branch)
INSERT INTO vision_expert.petty_cash_request (requested_by, branch_id, amount, reason, request_status) VALUES 
(8, 1, 10000.00, 'Office supplies', 'Approved'),
(8, 1, 15000.00, 'Travel expenses', 'Pending'),
(8, 2, 8000.00, 'Refreshments', 'Approved');

-- Petty Cash Allocation (depends on staff, branch)
INSERT INTO vision_expert.petty_cash_allocation (allocated_by, branch_id, amount, notes, month, year) VALUES 
(9, 1, 50000.00, 'Monthly allocation for January', 1, 2024),
(9, 2, 40000.00, 'Monthly allocation for January', 1, 2024),
(9, 3, 35000.00, 'Monthly allocation for January', 1, 2024);

-- Petty Cash (depends on branch, staff, petty_cash_allocation)
INSERT INTO vision_expert.petty_cash (type, date, category, description, amount, received_by, branch_id, allocation_id) VALUES 
('Expense', '2024-01-15', 'Supplies', 'Office stationery', 2500.00, 8, 1, 1),
('Expense', '2024-01-16', 'Travel', 'Fuel expenses', 3000.00, 8, 1, 1),
('Replenishment', '2024-01-20', 'Allocation', 'Monthly cash allocation', 50000.00, 9, 1, 1),
('Expense', '2024-01-21', 'Refreshments', 'Team meeting refreshments', 1500.00, 8, 2, 2),
('Expense', '2024-01-22', 'Supplies', 'Cleaning supplies', 1000.00, 8, 2, 2);

-- Stock Distribution (depends on stock, branch, frame)
INSERT INTO vision_expert.stock_distribution (stock_id, branch_id, quantity, status, notes, frame_id) VALUES 
(1, 2, 10, 'Pending Approval', 'Transfer to Kandy branch', 1),
(2, 3, 5, 'Pending Approval', 'Transfer to Galle branch', 2),
(3, 1, 10, 'Pending Approval', 'Transfer to Colombo branch', 3);

-- Batch (depends on branch)
INSERT INTO vision_expert.batch (batch_number, branch_id, current_status, current_step) VALUES 
('BATCH-2024-001', 1, 'Delivered to the Lab', 2),
('BATCH-2024-002', 2, 'Delivered to the Lab', 2),
('BATCH-2024-003', 3, 'Delivered to the Lab', 2);

-- Batch Order (depends on batch)
INSERT INTO vision_expert.batch_order (batch_id, order_id, placed_date, step1_intended, step1_actual, step2_intended, step2_actual) VALUES 
(1, '1', '2024-01-21', '2024-01-23', '2024-01-23', '2024-01-30', '2024-01-29'),
(1, '4', '2024-01-22', '2024-01-24', '2024-01-24', '2024-01-31', '2024-01-30'),
(2, '2', '2024-02-06', '2024-02-08', '2024-02-08', '2024-02-15', '2024-02-14'),
(3, '3', '2024-03-11', '2024-03-13', '2024-03-13', '2024-03-20', NULL);

-- Batch Timeline (depends on batch)
INSERT INTO vision_expert.batch_timeline (batch_id, delivered_to_lab_intended, delivered_to_lab_actual, received_from_lab_intended, received_from_lab_actual) VALUES 
(1, '2024-01-23', '2024-01-23', '2024-01-30', '2024-01-29'),
(2, '2024-02-08', '2024-02-08', '2024-02-15', '2024-02-14'),
(3, '2024-03-13', '2024-03-13', '2024-03-20', NULL);

-- Reminder Call (depends on order)
INSERT INTO vision_expert.reminder_call (order_id, before_lab_status, before_lab_reason, before_delivery_status, before_delivery_reason) VALUES 
(1, 'Called', 'Customer confirmed', 'Called', 'Customer available'),
(2, 'Called', 'Customer confirmed', 'Called', 'Customer available'),
(3, 'Called', 'Customer confirmed', NULL, NULL),
(4, 'Called', 'Customer confirmed', 'Called', 'Customer available'),
(5, 'Called', 'Customer confirmed', NULL, NULL);

-- Stock Movement History (depends on stock, branch)
INSERT INTO vision_expert.stock_movement_history (reference_table, reference_id, movement_type, stock_id, source_branch_id, target_branch_id, quantity, status, notes) VALUES 
('stock_distribution', 1, 'transfer_requested', 1, 1, 2, 10, 'Pending Approval', 'Transfer request initiated'),
('stock_distribution', 2, 'transfer_requested', 2, 1, 3, 5, 'Pending Approval', 'Transfer request initiated'),
('stock_distribution', 3, 'transfer_requested', 3, 2, 1, 10, 'Pending Approval', 'Transfer request initiated');

-- Damage History (depends on stock, branch)
INSERT INTO vision_expert.damage_history (reference_table, reference_id, event_type, stock_id, branch_id, quantity, reason, approved, approved_by, approved_at) VALUES 
('damaged_stock', 1, 'damage_reported', 1, 1, 2, 'Scratched during handling', false, NULL, NULL);

-- Damaged Stock (depends on stock)
INSERT INTO vision_expert.damaged_stock (stock_id, damaged_quantity, reason, status_bool) VALUES 
(1, 2, 'Scratched during handling', false);

-- Warranty (depends on order, complaint_status)
INSERT INTO vision_expert.warranty (Issue_type, description, status_id, order_id) VALUES 
('Frame defect', 'Frame hinge loose after 3 months', 1, 1),
('Lens scratch', 'Lens scratched within warranty period', 1, 2);

-- Login Activity (depends on staff)
INSERT INTO vision_expert.login_activity (staff_id, login_time) VALUES 
(1, '2024-01-21 08:00:00'),
(2, '2024-01-21 08:30:00'),
(4, '2024-01-21 09:00:00'),
(5, '2024-01-21 09:15:00'),
(6, '2024-01-21 09:30:00');

-- Head Office (depends on branch)
INSERT INTO vision_expert.head_office (branch_id) VALUES 
(1),
(2),
(3);

-- Branch Expenses (depends on branch, staff)
INSERT INTO vision_expert.branch_expenses (branch_id, added_by, reason) VALUES 
(1, 2, 'Monthly rent payment'),
(2, 3, 'Utility bills'),
(3, 2, 'Maintenance costs');

-- Re Order (depends on product_type, branch)
INSERT INTO vision_expert.re_order (product_type_id, branch_id) VALUES 
(1, 1),
(2, 2),
(1, 3);

-- Clinic Expenses (depends on clinic, staff)
INSERT INTO vision_expert.clinic_expenses (expenses, price, clinic_id, added_by) VALUES 
('Venue rental', 15000.00, 1, 2),
('Transportation', 5000.00, 2, 3),
('Refreshments', 3000.00, 3, 2);
