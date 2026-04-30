import React, { useState } from 'react'
import {
  Layout,
  Card,
  Typography,
  Button,
  Select,
  Input,
  Upload,
  Space,
  Form,
  Modal,
  message,
} from "antd";
const { Text } = Typography;
const { Dragger } = Upload;
import { InboxOutlined } from "@ant-design/icons";

const ADMIN_OFFICERS = [
  { value: "nimal", label: "Nimal Perera — Admin Officer" },
  { value: "saman", label: "Saman Kumara — Admin Officer" },
  { value: "dilani", label: "Dilani Jayawardena — Senior AO" },
];

function HandOverDetails({record, onCancel}) {
    const [selectedOfficer, setSelectedOfficer] = useState("nimal");
      const [notes, setNotes] = useState("");
       const primaryColor = "#1d4ed8";
       const [confirmOpen, setConfirmOpen] = useState(false);

       const handleConfirm = () => {
    setConfirmOpen(false);

    // TODO: call your API here (handover submit)
    message.success(
      `Submitted ${record.handoverId} to ${selectedOfficer} for verification`
    );

    // go back after submit (optional)
    onCancel?.();
  };

  return (
    <Card variant='borderless'
          style={{ borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 24 }}
          styles={{ body: { padding: "20px 24px" } }}
        >
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 16 }}>
            Handover details
          </Text>
 
          <Form layout="vertical">
            <Form.Item
              label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Hand over to (administrative officer)</Text>}
              required
            >
              <Select
                size="large"
                options={ADMIN_OFFICERS}
                value={selectedOfficer}
                onChange={setSelectedOfficer}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
 
            <Form.Item label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Notes (optional)</Text>}>
              <Input.TextArea
                rows={3}
                placeholder="Any remarks about this handover..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
 
            <Form.Item label={<Text style={{ fontSize: 13, fontWeight: 500 }}>Evidence (photo of bank deposit slip )</Text>}>
              <Dragger
                accept="image/*"
                multiple={false}
                beforeUpload={() => false}
                style={{ borderRadius: 10 }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: primaryColor, fontSize: 32 }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 14 }}>Click or drag photo to upload</p>
                <p className="ant-upload-hint" style={{ fontSize: 12 }}>JPG, PNG up to 5 MB</p>
              </Dragger>
            </Form.Item>
          </Form>
          <Space>
      <Button
        type="primary"
        size="large"
        onClick={() => setConfirmOpen(true)}
        tyle={{
            background: primaryColor,
            borderColor: primaryColor,
            borderRadius: 9,
            height: 44,
            paddingInline: 22,
          }}>
        Submit for verification
      </Button>
      <Button onClick={() => setShowForm(false)} 
            style={{
            background: "#1d4ed8",
            borderColor:" #1d4ed8",
            color: "#fff",
            borderRadius: 9,
            height: 44,
            paddingInline: 22,
          }}>
        Cancel
      </Button>
    </Space>
    <Modal
        title="Confirm submission"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onOk={handleConfirm}
        okText="Submit"
      >
        <p>
          Submit <b>{record?.handoverId}</b> (Rs. {record?.amount}) to{" "}
          <b>{selectedOfficer}</b>?
        </p>
      </Modal>
        </Card>
  )
}

export default HandOverDetails