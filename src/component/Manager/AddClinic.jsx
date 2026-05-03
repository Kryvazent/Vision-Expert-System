import React, {useState} from 'react'
import { Form, Input, DatePicker, Modal, Button} from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';

function AddClinic({open, onClose, onAdd}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // Simulate async save
      setTimeout(() => {
        onAdd?.(values);
        form.resetFields();
        setLoading(false);
        onClose?.();
      }, 400);
    } catch (_) {
      // validation failed — do nothing
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

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
          Add Clinic
        </span>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        style={{ marginTop: 12 }}
      >
        {/* Clinic Center */}
        <Form.Item
          name="clinicCenter"
          label={
            <span>
              <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
              <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                Clinic Center
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Please enter the clinic center location' }]}
        >
          <Input
            prefix={<EnvironmentOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter clinic center location"
            size="large"
            style={{ borderRadius: 8, fontSize: 14 }}
          />
        </Form.Item>
 
        {/* Date + Duration side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="date"
            label={
              <span>
                <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
                <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                  Date
                </span>
              </span>
            }
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              placeholder="Select date"
              size="large"
              style={{ width: '100%', borderRadius: 8, fontSize: 14 }}
              format="MMMM DD, YYYY"
            />
          </Form.Item>
 
          <Form.Item
            name="duration"
            label={
              <span>
                <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
                <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                  Duration
                </span>
              </span>
            }
            rules={[{ required: true, message: 'Please enter the duration' }]}
          >
            <Input
              prefix={<ClockCircleOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
              placeholder="e.g., 09:00 AM - 05:00 PM"
              size="large"
              style={{ borderRadius: 8, fontSize: 14 }}
            />
          </Form.Item>
        </div>
 
        {/* Responsible Person */}
        <Form.Item
          name="responsiblePerson"
          label={
            <span>
              <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
              <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                Responsible Person 01
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Please enter the responsible person name' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter person name"
            size="large"
            style={{ borderRadius: 8, fontSize: 14 }}
          />
        </Form.Item>
 
        {/* Contact Number */}
        <Form.Item
          name="contactNumber"
          label={
            <span>
              <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
              <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                Contact Number
              </span>
            </span>
          }
          rules={[
            { required: true, message: 'Please enter the contact number' },
            { pattern: /^\d{10}$/, message: 'Contact number must be exactly 10 digits' },
          ]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter contact number (10 digits)"
            size="large"
            maxLength={10}
            style={{ borderRadius: 8, fontSize: 14 }}
          />
        </Form.Item>

        <Form.Item
          name="responsiblePerson"
          label={
            <span>
              <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
              <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                Responsible Person 02
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Please enter the responsible person name' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter person name"
            size="large"
            style={{ borderRadius: 8, fontSize: 14 }}
          />
        </Form.Item>
 
        {/* Contact Number */}
        <Form.Item
          name="contactNumber"
          label={
            <span>
              <span style={{ color: '#ef4444', marginRight: 4 }}>*</span>
              <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                Contact Number
              </span>
            </span>
          }
          rules={[
            { required: true, message: 'Please enter the contact number' },
            { pattern: /^\d{10}$/, message: 'Contact number must be exactly 10 digits' },
          ]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: '#9ca3af', fontSize: 14 }} />}
            placeholder="Enter contact number (10 digits)"
            size="large"
            maxLength={10}
            style={{ borderRadius: 8, fontSize: 14 }}
          />
        </Form.Item>
 
        {/* Footer buttons */}
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
            onClick={handleAdd}
            style={{
              borderRadius: 8,
              minWidth: 90,
              fontSize: 14,
              backgroundColor: '#2563eb',
              borderColor: '#2563eb',
            }}
          >
            Add
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
      `}</style>
    </Modal>
    
  )
}

export default AddClinic