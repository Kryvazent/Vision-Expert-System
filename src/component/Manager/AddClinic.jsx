import React, { useEffect, useState } from 'react'
import { Form, Input, DatePicker, Modal, Button, TimePicker, Select } from 'antd';
import { EnvironmentOutlined, UserOutlined, PhoneOutlined, FolderOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';

const { RangePicker } = TimePicker;

function AddClinic({ open, onClose, onAdd, mode = 'add', clinicData = null }) {
  const [form] = Form.useForm();
  const [loading, setLoading]           = useState(false);
  const [projectSelected, setProjectSelected] = useState(false);

  const isEditMode = mode === 'edit';

  // Reset gate whenever the modal opens/closes
  useEffect(() => {
    if (!open) {
      setProjectSelected(false);
      return;
    }

    if (isEditMode && clinicData) {
      // Pre-fill all fields including project
      form.setFieldsValue({
        project:            clinicData.project ?? null,
        clinicCenter:       clinicData.clinicCenter,
        date:               clinicData.date ? dayjs(clinicData.date) : null,
        time:               clinicData.time,
        responsiblePerson:  clinicData.responsiblePerson01,
        contactNumber:      clinicData.contactNumber1,
        responsiblePerson2: clinicData.responsiblePerson02,
        contactNumber2:     clinicData.contactNumber2,
      });
      // Enable fields if a project is already set
      setProjectSelected(!!clinicData.project);
    } else {
      form.resetFields();
      setProjectSelected(false);
    }
  }, [isEditMode, clinicData, form, open]);

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setTimeout(() => {
        onAdd?.(values);
        form.resetFields();
        setProjectSelected(false);
        setLoading(false);
        onClose?.();
      }, 400);
    } catch (_) {
      // validation failed — stay open
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setProjectSelected(false);
    onClose?.();
  };

  const handleProjectChange = (value) => {
    setProjectSelected(!!value);

    if (!value) {
      form.resetFields([
        'clinicCenter', 'date', 'time',
        'responsiblePerson', 'contactNumber',
        'responsiblePerson2', 'contactNumber2',
      ]);
    }
  };

  // ── Shared style helpers ───────────────────────────────────────────────────
  const fieldLabel = (text) => (
    <span>
      <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
      <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>{text}</span>
    </span>
  );

  const disabledInputStyle = {
    borderRadius: 8,
    fontSize: 14,
    opacity: projectSelected ? 1 : 0.45,
    pointerEvents: projectSelected ? 'auto' : 'none',
    transition: 'opacity 0.25s ease',
  };


  const LOAD_ACTIVE_PROJECTS = gql`
  
    query LoadActiveProjects {
      projectCollection(filter: {is_active: {eq: true}}) {
        edges {
          node{
            id
            project_name
          }
        }
      }
    }
  `;
  const [loadActiveProjects, { data: activeProjectsData }] = useLazyQuery(LOAD_ACTIVE_PROJECTS);
  
  useEffect(()=>{

    loadActiveProjects();
  },[loadActiveProjects]);

  console.log('Active Projects Data:', activeProjectsData);

  const projects = activeProjectsData?.projectCollection?.edges?.map(edge => ({
    value: edge.node.id,
    label: edge.node.project_name,
  })) || [];


  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={720}
      centered
      closable
      destroyOnClose
      className="add-clinic-modal"
      title={
        <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
          {isEditMode ? 'Update Clinic' : 'Add Clinic'}
        </span>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        style={{ marginTop: 12 }}
      >

        {/* ── Project selector (always enabled) ───────────────────────────── */}
        <Form.Item
          name="project"
          label={fieldLabel('Project')}
          rules={[{ required: true, message: 'Please select a project' }]}
          style={{ marginBottom: 24 }}
        >
          <Select
            placeholder="Select a project to continue"
            size="large"
            allowClear
            showSearch
            optionFilterProp="label"
            options={projects}
            onChange={handleProjectChange}
            suffixIcon={<FolderOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            style={{ borderRadius: 8, fontSize: 14 }}
          />
        </Form.Item>

        {/* ── Divider + helper text ──────────────────────────────────────── */}
        {!projectSelected && (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 13,
            marginBottom: 20,
            padding: '10px 0',
            borderTop: '1px dashed #e5e7eb',
            borderBottom: '1px dashed #e5e7eb',
          }}>
            Select a project above to fill in clinic details
          </div>
        )}

        {/* ── Clinic Center ─────────────────────────────────────────────── */}
        <Form.Item
          name="clinicCenter"
          label={fieldLabel('Clinic Center')}
          rules={[{ required: true, message: 'Please enter the clinic center location' }]}
        >
          <Input
            disabled={!projectSelected}
            prefix={<EnvironmentOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter clinic center location"
            size="large"
            style={disabledInputStyle}
          />
        </Form.Item>

        {/* ── Date + Time ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="date"
            label={fieldLabel('Date')}
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              disabled={!projectSelected}
              placeholder="Select date"
              size="large"
              style={{ width: '100%', ...disabledInputStyle }}
              format="MMMM DD, YYYY"
            />
          </Form.Item>

          <Form.Item
            name="time"
            label={fieldLabel('Time')}
            rules={[{ required: true, message: 'Please select the time range' }]}
          >
            <RangePicker
              disabled={!projectSelected}
              format="HH:mm"
              size="large"
              style={{ width: '100%', ...disabledInputStyle }}
            />
          </Form.Item>
        </div>

        {/* ── Responsible Person 01 ─────────────────────────────────────── */}
        <Form.Item
          name="responsiblePerson"
          label={fieldLabel('Responsible Person 01')}
          rules={[{ required: true, message: 'Please enter the responsible person name' }]}
        >
          <Input
            disabled={!projectSelected}
            prefix={<UserOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter person name"
            size="large"
            style={disabledInputStyle}
          />
        </Form.Item>

        {/* ── Contact Number 01 ─────────────────────────────────────────── */}
        <Form.Item
          name="contactNumber"
          label={fieldLabel('Contact Number')}
          rules={[
            { required: true, message: 'Please enter the contact number' },
            { pattern: /^\d{10}$/, message: 'Contact number must be exactly 10 digits' },
          ]}
        >
          <Input
            disabled={!projectSelected}
            prefix={<PhoneOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter contact number (10 digits)"
            size="large"
            maxLength={10}
            style={disabledInputStyle}
          />
        </Form.Item>

        {/* ── Responsible Person 02 ─────────────────────────────────────── */}
        <Form.Item
          name="responsiblePerson2"
          label={fieldLabel('Responsible Person 02')}
          rules={[{ required: true, message: 'Please enter the responsible person name' }]}
        >
          <Input
            disabled={!projectSelected}
            prefix={<UserOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter person name"
            size="large"
            style={disabledInputStyle}
          />
        </Form.Item>

        {/* ── Contact Number 02 ─────────────────────────────────────────── */}
        <Form.Item
          name="contactNumber2"
          label={fieldLabel('Contact Number')}
          rules={[
            { required: true, message: 'Please enter the contact number' },
            { pattern: /^\d{10}$/, message: 'Contact number must be exactly 10 digits' },
          ]}
        >
          <Input
            disabled={!projectSelected}
            prefix={<PhoneOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter contact number (10 digits)"
            size="large"
            maxLength={10}
            style={disabledInputStyle}
          />
        </Form.Item>

        {/* ── Footer buttons ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Button
            size="large"
            onClick={handleCancel}
            style={{ borderRadius: 8, minWidth: 90, fontSize: 14 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            disabled={!projectSelected}
            onClick={handleAdd}
            style={{
              borderRadius: 8,
              minWidth: 90,
              fontSize: 14,
              backgroundColor: projectSelected ? '#2563eb' : '#93c5fd',
              borderColor:     projectSelected ? '#2563eb' : '#93c5fd',
              transition: 'background-color 0.25s ease, border-color 0.25s ease',
            }}
          >
            {isEditMode ? 'Update' : 'Add'}
          </Button>
        </div>
      </Form>

      <style>{`
        .add-clinic-modal .ant-modal-content {
          border-radius  : 16px;
          padding        : 28px 32px;
          box-shadow     : 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        .add-clinic-modal .ant-modal-header {
          border-bottom  : none;
          padding        : 0 0 4px 0;
          margin-bottom  : 0;
        }
        .add-clinic-modal .ant-modal-close {
          top            : 22px;
          right          : 24px;
          color          : #6b7280;
        }
        .add-clinic-modal .ant-modal-close:hover {
          color          : #111827;
          background     : #f3f4f6;
          border-radius  : 6px;
        }
        .add-clinic-modal .ant-form-item {
          margin-bottom  : 20px;
        }
        .add-clinic-modal .ant-form-item-label {
          padding-bottom : 6px;
        }
        .add-clinic-modal .ant-form-item-label > label {
          height         : auto;
        }
        .add-clinic-modal .ant-input-affix-wrapper {
          border-radius  : 8px;
          border-color   : #d1d5db;
          padding        : 0 12px;
        }
        .add-clinic-modal .ant-input-affix-wrapper:hover,
        .add-clinic-modal .ant-input-affix-wrapper-focused {
          border-color   : #2563eb;
          box-shadow     : 0 0 0 2px rgba(37, 99, 235, 0.1);
        }
        .add-clinic-modal .ant-picker {
          border-radius  : 8px;
          border-color   : #d1d5db;
          width          : 100%;
        }
        .add-clinic-modal .ant-picker:hover,
        .add-clinic-modal .ant-picker-focused {
          border-color   : #2563eb;
          box-shadow     : 0 0 0 2px rgba(37, 99, 235, 0.1);
        }
        .add-clinic-modal .ant-input {
          font-size      : 14px;
          color          : #374151;
        }
        .add-clinic-modal .ant-input::placeholder {
          color          : #9ca3af;
        }
        .add-clinic-modal .ant-select-selector {
          border-radius  : 8px !important;
          border-color   : #d1d5db !important;
          font-size      : 14px;
        }
        .add-clinic-modal .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
        .add-clinic-modal .ant-select-focused .ant-select-selector {
          border-color   : #2563eb !important;
          box-shadow     : 0 0 0 2px rgba(37, 99, 235, 0.1) !important;
        }
      `}</style>
    </Modal>
  );
}

export default AddClinic;