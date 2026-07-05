-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE vision_expert.branch (
  id integer NOT NULL DEFAULT nextval('vision_expert.branch_id_seq'::regclass),
  email text NOT NULL,
  address text NOT NULL,
  is_active boolean DEFAULT true,
  branch_name text,
  revenue_target double precision,
  order_target bigint,
  CONSTRAINT branch_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.staff (
  id integer NOT NULL DEFAULT nextval('vision_expert.staff_id_seq'::regclass),
  first_name character varying,
  last_name character varying,
  nic character varying,
  branch_id integer,
  auth_user_id uuid UNIQUE,
  role_id bigint NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  email text NOT NULL,
  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id),
  CONSTRAINT fk_staff_auth FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT staff_role_id_fkey FOREIGN KEY (role_id) REFERENCES vision_expert.role(id)
);
CREATE TABLE vision_expert.role (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  role_name character varying,
  CONSTRAINT role_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.prescription (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  remarks text,
  clinic_attend_customer_id bigint NOT NULL,
  right_sph double precision NOT NULL,
  right_cyl double precision NOT NULL,
  right_axis double precision NOT NULL,
  left_sph double precision NOT NULL,
  left_cyl double precision NOT NULL,
  left_axis double precision NOT NULL,
  right_add double precision,
  left_add double precision,
  pupillary_distance double precision NOT NULL,
  CONSTRAINT prescription_pkey PRIMARY KEY (id),
  CONSTRAINT prescription_clinic_attend_customer_id_fkey FOREIGN KEY (clinic_attend_customer_id) REFERENCES vision_expert.clinic_attend_customer(id)
);
CREATE TABLE vision_expert.project (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  branch_id integer NOT NULL,
  project_name text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  start_date date,
  CONSTRAINT project_pkey PRIMARY KEY (id),
  CONSTRAINT clinic_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.clinic_staff (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  clinic_id bigint NOT NULL,
  staff_id integer NOT NULL,
  CONSTRAINT clinic_staff_pkey PRIMARY KEY (id),
  CONSTRAINT session_staff_session_id_fkey FOREIGN KEY (clinic_id) REFERENCES vision_expert.clinic(id),
  CONSTRAINT session_staff_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES vision_expert.staff(id)
);
CREATE TABLE vision_expert.clinic (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  venue text NOT NULL,
  from time without time zone NOT NULL,
  to time without time zone NOT NULL,
  project_id bigint NOT NULL,
  date date,
  responsible_person_01 text,
  responsible_person_02 text,
  responsible_person_01_contact_no character varying,
  responsible_person_02_contact_no character varying,
  clinic_status_id bigint NOT NULL,
  branch_id integer NOT NULL,
  CONSTRAINT clinic_pkey PRIMARY KEY (id),
  CONSTRAINT clinic_project_id_fkey FOREIGN KEY (project_id) REFERENCES vision_expert.project(id),
  CONSTRAINT clinic_clinic_status_id_fkey FOREIGN KEY (clinic_status_id) REFERENCES vision_expert.clinic_status(id),
  CONSTRAINT clinic_branch_id_fkey1 FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.clinic_expenses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expenses text,
  price double precision,
  clinic_id bigint,
  added_by integer,
  CONSTRAINT clinic_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT session_expenses_added_by_fkey FOREIGN KEY (added_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT clinic_expenses_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES vision_expert.clinic(id)
);
CREATE TABLE vision_expert.clinic_has_equipment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  clinic_id bigint,
  equipment_id bigint,
  allocated_by integer,
  CONSTRAINT clinic_has_equipment_pkey PRIMARY KEY (id),
  CONSTRAINT session_has_equipment_session_id_fkey FOREIGN KEY (clinic_id) REFERENCES vision_expert.clinic(id),
  CONSTRAINT session_has_equipment_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES vision_expert.equipment(id),
  CONSTRAINT session_has_equipment_allocated_by_fkey FOREIGN KEY (allocated_by) REFERENCES vision_expert.staff(id)
);
CREATE TABLE vision_expert.clinic_attend_customer (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_has_branch_id bigint NOT NULL,
  clinic_id bigint NOT NULL,
  CONSTRAINT clinic_attend_customer_pkey PRIMARY KEY (id),
  CONSTRAINT session_attend_customer_customer_has_branch_id_fkey FOREIGN KEY (customer_has_branch_id) REFERENCES vision_expert.customer_has_branch(id),
  CONSTRAINT clinic_attend_customer_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES vision_expert.clinic(id)
);
CREATE TABLE vision_expert.head_office (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  branch_id integer NOT NULL,
  CONSTRAINT head_office_pkey PRIMARY KEY (id),
  CONSTRAINT head_office_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.equipment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  reference_no character varying NOT NULL,
  branch_id integer NOT NULL,
  CONSTRAINT equipment_pkey PRIMARY KEY (id),
  CONSTRAINT equipment_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.branch_expenses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  branch_id integer NOT NULL,
  added_by bigint NOT NULL,
  reason text NOT NULL,
  CONSTRAINT branch_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT branch_expenses_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.customer (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name character varying NOT NULL,
  last_name character varying,
  contact_no character varying NOT NULL,
  address text,
  dob date NOT NULL,
  nic character varying NOT NULL,
  CONSTRAINT customer_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.customer_has_branch (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_id bigint NOT NULL,
  branch_id integer NOT NULL,
  CONSTRAINT customer_has_branch_pkey PRIMARY KEY (id),
  CONSTRAINT customer_has_branch_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES vision_expert.customer(id),
  CONSTRAINT customer_has_branch_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.warranty (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  Issue_type character varying,
  description character varying,
  status_id bigint,
  order_id bigint,
  CONSTRAINT warranty_pkey PRIMARY KEY (id),
  CONSTRAINT warranty_status_id_fkey FOREIGN KEY (status_id) REFERENCES vision_expert.complaint_status(id),
  CONSTRAINT warranty_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id)
);
CREATE TABLE vision_expert.order_status (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL,
  deesc text,
  CONSTRAINT order_status_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.payment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  total_payment double precision NOT NULL,
  remarks text,
  order_id bigint NOT NULL,
  discount double precision NOT NULL,
  additional_fee double precision NOT NULL DEFAULT '0'::double precision,
  advance double precision NOT NULL DEFAULT '0'::double precision,
  discount_approved boolean NOT NULL DEFAULT false,
  CONSTRAINT payment_pkey PRIMARY KEY (id),
  CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id)
);
CREATE TABLE vision_expert.order_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id bigint NOT NULL,
  order_statsu_id bigint NOT NULL,
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id),
  CONSTRAINT order_status_history_order_statsu_id_fkey FOREIGN KEY (order_statsu_id) REFERENCES vision_expert.order_status(id)
);
CREATE TABLE vision_expert.discount_verified (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  verified boolean NOT NULL,
  payment_id bigint NOT NULL,
  CONSTRAINT discount_verified_pkey PRIMARY KEY (id),
  CONSTRAINT discount_verified_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES vision_expert.payment(id)
);
CREATE TABLE vision_expert.stock (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id bigint NOT NULL,
  available_quantity bigint NOT NULL,
  branch_id integer NOT NULL,
  added_by integer NOT NULL,
  supplier_id bigint,
  CONSTRAINT stock_pkey PRIMARY KEY (id),
  CONSTRAINT stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES vision_expert.product(id),
  CONSTRAINT stock_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id),
  CONSTRAINT stock_added_by_fkey FOREIGN KEY (added_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT stock_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES vision_expert.supplier(id)
);
CREATE TABLE vision_expert.product (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  product_type_id bigint NOT NULL,
  brand_id bigint NOT NULL,
  purchase_price double precision NOT NULL,
  selling_price double precision NOT NULL,
  purchased_quantity bigint NOT NULL,
  warranty_in_months bigint NOT NULL,
  supplier_id bigint,
  sku character varying NOT NULL UNIQUE,
  CONSTRAINT product_pkey PRIMARY KEY (id),
  CONSTRAINT product_product_type_id_fkey FOREIGN KEY (product_type_id) REFERENCES vision_expert.product_type(id),
  CONSTRAINT product_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES vision_expert.brand(id),
  CONSTRAINT product_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES vision_expert.supplier(id)
);
CREATE TABLE vision_expert.product_type (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying NOT NULL,
  CONSTRAINT product_type_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.brand (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  brand character varying NOT NULL,
  CONSTRAINT brand_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.frame_type (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying NOT NULL,
  CONSTRAINT frame_type_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.frame (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  color character varying,
  serial_no character varying NOT NULL UNIQUE,
  frame_type_id bigint NOT NULL,
  product_id bigint NOT NULL,
  branch_id integer NOT NULL,
  status character varying NOT NULL DEFAULT 'in_stock'::character varying CHECK (status::text = ANY (ARRAY['in_stock'::character varying, 'reserved'::character varying, 'sold'::character varying, 'damaged'::character varying, 'transferred'::character varying]::text[])),
  CONSTRAINT frame_pkey PRIMARY KEY (id),
  CONSTRAINT frame_frame_type_id_fkey FOREIGN KEY (frame_type_id) REFERENCES vision_expert.frame_type(id),
  CONSTRAINT frame_product_id_fkey FOREIGN KEY (product_id) REFERENCES vision_expert.product(id),
  CONSTRAINT frame_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.lense_type (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying NOT NULL,
  price double precision NOT NULL DEFAULT '0'::double precision,
  CONSTRAINT lense_type_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.order (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  placed_at timestamp with time zone NOT NULL DEFAULT now(),
  agrahara_applied boolean NOT NULL,
  estimated_delivery timestamp with time zone NOT NULL DEFAULT (now() + '10 days'::interval),
  remarks text,
  order_status_id bigint NOT NULL DEFAULT '1'::bigint,
  clinic_attend_customer_id bigint NOT NULL,
  prescription_id bigint NOT NULL,
  lens_type_id bigint NOT NULL,
  frame_type_id bigint NOT NULL,
  frame_id bigint NOT NULL,
  total_price double precision NOT NULL,
  frame_warranty_month integer,
  lense_warranty_month integer,
  customer_confirmed_at timestamp with time zone,
  customer_confirmed_by bigint,
  sent_to_lab_at timestamp with time zone,
  received_from_lab_at timestamp with time zone,
  first_reminder_call_at timestamp with time zone,
  second_reminder_call_at timestamp with time zone,
  delivered_at timestamp with time zone,
  delivered_by bigint,
  balance_amount double precision DEFAULT 0,
  intended_customer_confirm_date date,
  intended_send_to_lab_date date,
  intended_receive_from_lab_date date,
  intended_first_reminder_date date,
  intended_second_reminder_date date,
  intended_delivery_date date,
  CONSTRAINT order_pkey PRIMARY KEY (id),
  CONSTRAINT order_order_status_id_fkey FOREIGN KEY (order_status_id) REFERENCES vision_expert.order_status(id),
  CONSTRAINT order_clinic_attend_customer_id_fkey FOREIGN KEY (clinic_attend_customer_id) REFERENCES vision_expert.clinic_attend_customer(id),
  CONSTRAINT order_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES vision_expert.prescription(id),
  CONSTRAINT order_lens_type_id_fkey FOREIGN KEY (lens_type_id) REFERENCES vision_expert.lense_type(id),
  CONSTRAINT order_frame_type_id_fkey FOREIGN KEY (frame_type_id) REFERENCES vision_expert.frame_type(id),
  CONSTRAINT order_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES vision_expert.frame(id),
  CONSTRAINT order_customer_confirmed_by_fkey FOREIGN KEY (customer_confirmed_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT order_delivered_by_fkey FOREIGN KEY (delivered_by) REFERENCES vision_expert.staff(id)
);
CREATE TABLE vision_expert.complaint (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id bigint NOT NULL,
  complaint text NOT NULL,
  complaint_status_id bigint NOT NULL,
  assigned_to integer,
  assigned_at timestamp with time zone,
  resolution_description text,
  resolved_at timestamp with time zone,
  CONSTRAINT complaint_pkey PRIMARY KEY (id),
  CONSTRAINT complaint_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id),
  CONSTRAINT complaint_complaint_status_id_fkey FOREIGN KEY (complaint_status_id) REFERENCES vision_expert.complaint_status(id),
  CONSTRAINT complaint_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES vision_expert.staff(id)
);
CREATE TABLE vision_expert.complaint_status (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL,
  CONSTRAINT complaint_status_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.clinic_status (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL,
  CONSTRAINT clinic_status_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.damaged_stock (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  stock_id bigint NOT NULL,
  damaged_quantity bigint NOT NULL,
  reason text NOT NULL,
  status_bool boolean NOT NULL,
  review_status text NOT NULL DEFAULT 'Pending'::text CHECK (review_status = ANY (ARRAY['Pending'::text, 'Approved'::text, 'Rejected'::text])),
  rejection_reason text,
  reviewed_by integer,
  reviewed_at timestamp with time zone,
  CONSTRAINT damaged_stock_pkey PRIMARY KEY (id),
  CONSTRAINT damaged_stock_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES vision_expert.stock(id),
  CONSTRAINT damaged_stock_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES vision_expert.staff(id)
);
CREATE TABLE vision_expert.re_order (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_type_id bigint NOT NULL,
  branch_id integer NOT NULL,
  CONSTRAINT re_order_pkey PRIMARY KEY (id),
  CONSTRAINT re_order_product_type_id_fkey FOREIGN KEY (product_type_id) REFERENCES vision_expert.product_type(id),
  CONSTRAINT re_order_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.petty_cash (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying NOT NULL,
  date date NOT NULL,
  category character varying NOT NULL,
  description text NOT NULL,
  amount double precision NOT NULL,
  received_by integer NOT NULL,
  branch_id integer NOT NULL,
  allocation_id bigint,
  CONSTRAINT petty_cash_pkey PRIMARY KEY (id),
  CONSTRAINT petty_cash_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id),
  CONSTRAINT petty_cash_received_by_fkey FOREIGN KEY (received_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT petty_cash_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES vision_expert.petty_cash_allocation(id)
);
CREATE TABLE vision_expert.cash_transfers_to_admin (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  by integer NOT NULL,
  amount double precision NOT NULL,
  cash_transfer_status_id bigint NOT NULL DEFAULT '1'::bigint,
  note text NOT NULL DEFAULT '""'::text,
  cash_type_id bigint,
  branch_id integer,
  manager_proof_status text DEFAULT 'Awaiting'::text,
  manager_proof_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  admin_proof_status text,
  admin_proof_at timestamp with time zone,
  bank_deposit boolean,
  rejection_reason text,
  CONSTRAINT cash_transfers_to_admin_pkey PRIMARY KEY (id),
  CONSTRAINT cash_transfers_to_admin_cash_transfer_status_id_fkey FOREIGN KEY (cash_transfer_status_id) REFERENCES vision_expert.cash_transfer_status(id),
  CONSTRAINT cash_transfers_to_admin_by_fkey FOREIGN KEY (by) REFERENCES vision_expert.staff(id),
  CONSTRAINT cash_transfers_to_admin_cash_type_id_fkey FOREIGN KEY (cash_type_id) REFERENCES vision_expert.cash_type(id),
  CONSTRAINT cash_transfers_to_admin_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.cash_transfer_status (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL,
  CONSTRAINT cash_transfer_status_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.lab_follow_up_status (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  status text NOT NULL,
  CONSTRAINT lab_follow_up_status_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.lab_follow_up (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  order_id bigint NOT NULL,
  clinic_id bigint NOT NULL,
  sent_to_lab_date date NOT NULL,
  expected_return_date date NOT NULL,
  received_date date,
  note text DEFAULT ''::text,
  lab_follow_up_status_id bigint NOT NULL DEFAULT 1,
  branch_id integer,
  CONSTRAINT lab_follow_up_pkey PRIMARY KEY (id),
  CONSTRAINT lab_follow_up_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id),
  CONSTRAINT lab_follow_up_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES vision_expert.clinic(id),
  CONSTRAINT lab_follow_up_status_id_fkey FOREIGN KEY (lab_follow_up_status_id) REFERENCES vision_expert.lab_follow_up_status(id),
  CONSTRAINT lab_follow_up_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.supplier (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  contact_no character varying,
  email text,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT supplier_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.stock_distribution (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  stock_id bigint NOT NULL,
  branch_id integer NOT NULL,
  quantity bigint NOT NULL,
  status text NOT NULL DEFAULT 'Pending Approval'::text,
  notes text,
  frame_id bigint,
  CONSTRAINT stock_distribution_pkey PRIMARY KEY (id),
  CONSTRAINT stock_distribution_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES vision_expert.stock(id),
  CONSTRAINT stock_distribution_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id),
  CONSTRAINT stock_distribution_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES vision_expert.frame(id)
);
CREATE TABLE vision_expert.batch (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  batch_number character varying NOT NULL,
  branch_id integer NOT NULL,
  current_status text NOT NULL DEFAULT 'Delivered to the Lab'::text,
  current_step integer NOT NULL DEFAULT 2,
  CONSTRAINT batch_pkey PRIMARY KEY (id),
  CONSTRAINT batch_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.batch_order (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  batch_id bigint NOT NULL,
  order_id character varying NOT NULL,
  placed_date date NOT NULL,
  step1_intended date,
  step1_actual date,
  step2_intended date,
  step2_actual date,
  step3_intended date,
  step3_actual date,
  step4_intended date,
  step4_actual date,
  step5_intended date,
  step5_actual date,
  step6_intended date,
  step6_actual date,
  CONSTRAINT batch_order_pkey PRIMARY KEY (id),
  CONSTRAINT batch_order_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES vision_expert.batch(id)
);
CREATE TABLE vision_expert.batch_timeline (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  batch_id bigint NOT NULL UNIQUE,
  delivered_to_lab_intended date,
  delivered_to_lab_actual date,
  received_from_lab_intended date,
  received_from_lab_actual date,
  CONSTRAINT batch_timeline_pkey PRIMARY KEY (id),
  CONSTRAINT batch_timeline_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES vision_expert.batch(id)
);
CREATE TABLE vision_expert.reminder_call (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id bigint NOT NULL UNIQUE,
  before_lab_status text,
  before_lab_reason text,
  before_lab_custom_reason text,
  before_delivery_status text,
  before_delivery_reason text,
  before_delivery_custom_reason text,
  before_delivery_2_status text,
  before_delivery_2_reason text,
  before_delivery_2_custom_reason text,
  CONSTRAINT reminder_call_pkey PRIMARY KEY (id),
  CONSTRAINT reminder_call_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id)
);
CREATE TABLE vision_expert.delivery_order (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id bigint,
  delivered_by bigint,
  payment_received boolean,
  payment_type character varying,
  paid_amount double precision,
  balance_amount double precision,
  status character varying,
  updated_date timestamp without time zone DEFAULT now(),
  CONSTRAINT delivery_order_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_order_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id)
);
CREATE TABLE vision_expert.cash_type (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying NOT NULL,
  CONSTRAINT cash_type_pkey PRIMARY KEY (id)
);
CREATE TABLE vision_expert.login_activity (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  auth_user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  staff_id bigint,
  login_time timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT login_activity_pkey PRIMARY KEY (id),
  CONSTRAINT login_activity_staff_fk FOREIGN KEY (staff_id) REFERENCES vision_expert.staff(id)
);
CREATE TABLE vision_expert.product_type_brand (
  id bigint NOT NULL DEFAULT nextval('vision_expert.product_type_brand_id_seq'::regclass),
  product_type_id bigint NOT NULL,
  brand_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_type_brand_pkey PRIMARY KEY (id),
  CONSTRAINT product_type_brand_product_type_id_fkey FOREIGN KEY (product_type_id) REFERENCES vision_expert.product_type(id),
  CONSTRAINT product_type_brand_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES vision_expert.brand(id)
);
CREATE TABLE vision_expert.stock_movement_history (
  id bigint NOT NULL DEFAULT nextval('vision_expert.stock_movement_history_id_seq'::regclass),
  reference_table text NOT NULL,
  reference_id bigint NOT NULL,
  movement_type text NOT NULL CHECK (movement_type = ANY (ARRAY['allocation_requested'::text, 'allocation_approved'::text, 'allocation_rejected'::text, 'transfer_completed'::text, 'transfer_requested'::text])),
  stock_id bigint,
  frame_id bigint,
  source_branch_id integer,
  target_branch_id integer,
  quantity bigint NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'Pending Approval'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_movement_history_pkey PRIMARY KEY (id),
  CONSTRAINT stock_movement_history_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES vision_expert.stock(id),
  CONSTRAINT stock_movement_history_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES vision_expert.frame(id),
  CONSTRAINT stock_movement_history_source_branch_id_fkey FOREIGN KEY (source_branch_id) REFERENCES vision_expert.branch(id),
  CONSTRAINT stock_movement_history_target_branch_id_fkey FOREIGN KEY (target_branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.damage_history (
  id bigint NOT NULL DEFAULT nextval('vision_expert.damage_history_id_seq'::regclass),
  reference_table text NOT NULL DEFAULT 'damaged_stock'::text,
  reference_id bigint NOT NULL,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['damage_reported'::text, 'damage_approved'::text, 'damage_rejected'::text])),
  stock_id bigint,
  branch_id integer,
  quantity bigint NOT NULL DEFAULT 1,
  reason text,
  approved boolean NOT NULL DEFAULT false,
  approved_by bigint,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT damage_history_pkey PRIMARY KEY (id),
  CONSTRAINT damage_history_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES vision_expert.stock(id),
  CONSTRAINT damage_history_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);
CREATE TABLE vision_expert.order_payment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id bigint NOT NULL,
  amount double precision NOT NULL,
  payment_method character varying NOT NULL,
  payment_type character varying NOT NULL,
  notes text,
  received_by bigint NOT NULL,
  cash_transfer_id bigint,
  CONSTRAINT order_payment_pkey PRIMARY KEY (id),
  CONSTRAINT order_payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES vision_expert.order(id),
  CONSTRAINT order_payment_received_by_fkey FOREIGN KEY (received_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT order_payment_cash_transfer_id_fkey FOREIGN KEY (cash_transfer_id) REFERENCES vision_expert.cash_transfers_to_admin(id)
);
CREATE TABLE vision_expert.petty_cash_request (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  requested_by bigint NOT NULL,
  branch_id integer NOT NULL,
  amount double precision NOT NULL,
  reason text,
  request_status character varying NOT NULL DEFAULT 'Pending'::character varying,
  reviewed_at timestamp with time zone,
  reviewed_by bigint,
  rejection_reason text,
  CONSTRAINT petty_cash_request_pkey PRIMARY KEY (id),
  CONSTRAINT petty_cash_request_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT petty_cash_request_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id),
  CONSTRAINT petty_cash_request_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES vision_expert.staff(id)
);
CREATE TABLE vision_expert.petty_cash_allocation (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  allocated_by bigint NOT NULL,
  branch_id integer NOT NULL,
  amount double precision NOT NULL,
  notes text,
  month integer NOT NULL,
  year integer NOT NULL,
  CONSTRAINT petty_cash_allocation_pkey PRIMARY KEY (id),
  CONSTRAINT petty_cash_allocation_allocated_by_fkey FOREIGN KEY (allocated_by) REFERENCES vision_expert.staff(id),
  CONSTRAINT petty_cash_allocation_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES vision_expert.branch(id)
);