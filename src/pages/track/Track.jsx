import { useState } from "react";
import { Card, Input, Button, Tag, Steps, Descriptions, message } from "antd";
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
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const TRACK_ORDER = gql`
  query TrackOrder($orderId: BigInt!) {
    orderCollection(filter: { id: { eq: $orderId } }) {
      edges {
        node {
          id
          total_price
          balance_amount
          placed_at
          estimated_delivery
          delivered_at
          order_status {
            status
          }
          clinic_attend_customer {
            clinic {
              branch {
                branch_name
              }
            }
            customer_has_branch {
              customer {
                first_name
                last_name
                contact_no
              }
            }
          }
          order_paymentCollection {
            edges {
              node {
                amount
              }
            }
          }
        }
      }
    }
  }
`;

const parseTrackingId = (input) => {
  const digits = String(input || "").replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatMoney = (value) => Number(value || 0).toLocaleString();

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

export default function Track() {
  const [trackingId, setTrackingId] = useState("");
  const [order,      setOrder]      = useState(null);
  const [searched,   setSearched]   = useState(false);
  const [trackOrder, { loading }] = useLazyQuery(TRACK_ORDER, { fetchPolicy: "network-only" });

  const handleSearch = async () => {
    const orderId = parseTrackingId(trackingId);
    if (!orderId) {
      message.error("Enter a valid tracking ID, e.g. OD123 or 123.");
      return;
    }

    setSearched(false);
    setOrder(null);

    try {
      const result = await trackOrder({ variables: { orderId } });
      const node = result.data?.orderCollection?.edges?.[0]?.node;

      if (!node) {
        setSearched(true);
        return;
      }

      const customer = node.clinic_attend_customer?.customer_has_branch?.customer;
      const paidAmount = node.order_paymentCollection?.edges?.reduce(
        (sum, edge) => sum + Number(edge.node.amount || 0),
        0
      ) || 0;
      const totalAmount = Number(node.total_price || 0);
      const remainingAmount = node.balance_amount != null
        ? Number(node.balance_amount)
        : Math.max(totalAmount - paidAmount, 0);

      setOrder({
        trackingId: `OD${node.id}`,
        status: normalizeStatus(node.order_status?.status),
        statusLabel: node.order_status?.status || "Pending",
        customerName: `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() || "-",
        customerMobile: customer?.contact_no || "-",
        branch: node.clinic_attend_customer?.clinic?.branch?.branch_name || "-",
        orderDate: formatDate(node.placed_at),
        deliveryDate: formatDate(node.delivered_at || node.estimated_delivery),
        totalAmount,
        advancePaid: paidAmount,
        remainingAmount,
        paymentStatus: remainingAmount <= 0 ? "completed" : "pending",
      });
      setSearched(true);
    } catch (error) {
      console.error("Track order failed:", error);
      message.error("Unable to load order tracking details.");
      setSearched(true);
    }
  };

  const getStatusStep = (status) => {
    const map = {
      pending: 0,
      confirmed: 1,
      active: 1,
      "in lab": 2,
      "ready for delivery": 2,
      delivered: 3,
      "final delivered": 3,
      completed: 3,
    };
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
              {loading ? "Tracking..." : "Track"}
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

            <Card
              title={`Order ${order.trackingId}`}
              extra={
                <Tag color={getStatusStep(order.status) === 3 ? "success" : "processing"}>
                  {order.statusLabel}
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
                  Rs. {formatMoney(order.totalAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Advance Paid">
                  Rs. {formatMoney(order.advancePaid)}
                </Descriptions.Item>
                <Descriptions.Item label="Remaining Amount">
                  <span style={{ color: order.remainingAmount === 0 ? "#52c41a" : "#ff4d4f", fontWeight: 600 }}>
                    Rs. {formatMoney(order.remainingAmount)}
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
                  {formatMoney(order.remainingAmount)} must be completed before delivery.
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
