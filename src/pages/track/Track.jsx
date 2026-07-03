import { useState } from "react";
import { Card, Input, Button, Tag, Steps, Descriptions } from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  CarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";

export default function Track() {
  const [trackingId, setTrackingId] = useState("");
  const [order,      setOrder]      = useState(null);
  const [searched,   setSearched]   = useState(false);

  const handleSearch = () => {
    // Lookup logic goes here
    setSearched(true);
  };

  const getStatusStep = (status) => {
    const map = { new: 0, processing: 1, shipped: 2, delivered: 3 };
    return map[status] ?? 0;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8f0fe 0%, #dbeafe 50%, #ede9fe 100%)",
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* ── Search card ── */}
        <Card style={{ marginBottom: 24 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "var(--ve-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                boxShadow: "0 4px 16px rgba(22,119,255,0.35)",
              }}
            >
              <EyeOutlined style={{ fontSize: 28, color: "#ffffff" }} />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--ve-primary)",
                margin: "0 0 4px",
              }}
            >
              Vision Expert Opticals
            </h1>
            <p style={{ color: "var(--ve-text-muted)", margin: 0, fontSize: 14 }}>
              Track Your Order
            </p>
          </div>

          {/* Search bar */}
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              size="large"
              placeholder="Enter Tracking ID (e.g., VE-2024-001234)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: "var(--ve-text-muted)" }} />}
            />
            <Button type="primary" size="large" onClick={handleSearch}>
              Track
            </Button>
          </div>

          {searched && !order && (
            <div style={{ textAlign: "center", padding: "24px 0 8px", color: "var(--ve-text-muted)" }}>
              No order found with this tracking ID.
            </div>
          )}
        </Card>

        {/* ── Order result ── */}
        {order && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Status card */}
            <Card
              title={`Order ${order.trackingId}`}
              extra={
                <Tag color={order.status === "delivered" ? "success" : "processing"}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Tag>
              }
            >
              <Steps
                current={getStatusStep(order.status)}
                items={[
                  { title: "Order Placed",  description: order.orderDate,    icon: <ShoppingOutlined /> },
                  { title: "Processing",    description: "Preparing order",  icon: <ClockCircleOutlined /> },
                  { title: "Shipped",       description: "Out for delivery", icon: <CarOutlined /> },
                  { title: "Delivered",     description: order.deliveryDate, icon: <CheckCircleOutlined /> },
                ]}
              />
            </Card>

            {/* Order details */}
            <Card title="Order Details">
              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Customer Name">{order.customerName}</Descriptions.Item>
                <Descriptions.Item label="Mobile">{order.customerMobile}</Descriptions.Item>
                <Descriptions.Item label="Branch">{order.branch}</Descriptions.Item>
                <Descriptions.Item label="Order Date">{order.orderDate}</Descriptions.Item>
                <Descriptions.Item label="Expected Delivery">{order.deliveryDate}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Payment info */}
            <Card title="Payment Information">
              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Total Amount">
                  Rs. {order.totalAmount?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Advance Paid">
                  Rs. {order.advancePaid?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Remaining Amount">
                  <span style={{ color: order.remainingAmount === 0 ? "#52c41a" : "#ff4d4f", fontWeight: 600 }}>
                    Rs. {order.remainingAmount?.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag color={order.paymentStatus === "completed" ? "success" : "warning"}>
                    {order.paymentStatus?.replace("_", " ").toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              {order.remainingAmount > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    background: "#fffbe6",
                    border: "1px solid #ffe58f",
                    borderRadius: "var(--ve-radius-md)",
                    fontSize: 13,
                    color: "#875800",
                  }}
                >
                  <strong>Note:</strong> Remaining payment of Rs.{" "}
                  {order.remainingAmount?.toLocaleString()} must be completed before delivery.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── Back to login ── */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link
            to="/"
            style={{
              color: "var(--ve-text-muted)",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ArrowLeftOutlined />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
