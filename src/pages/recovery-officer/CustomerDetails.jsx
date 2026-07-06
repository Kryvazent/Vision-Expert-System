import { useState, useEffect } from "react";
import {
  Typography, Radio, Input, Table, Tag, Space, message, Empty, Button,
} from "antd";
import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const { Title, Text } = Typography;

// ── Constants ─────────────────────────────────────────────────────────────────
const MODE_ORDER = "order";
const MODE_PHONE = "phone";
const MODE_NAME  = "name";

const QUICK_TRIES = ["OD1234", "OD1230", "OD1232", "OD1233"];

// ── GraphQL ───────────────────────────────────────────────────────────────────
// Same pg_graphql conventions as RecoverySheet: snake_case fields, forward
// relations as singular nested objects (FK → PK), reverse relations as
// `<table>Collection` (PK ← FK). No custom views — everything is native
// table/relation traversal, same as GET_RECOVERY_ORDERS.

const ORDER_FIELDS = `
  id
  placed_at
  total_price
  remarks
  frame_type {
    type
  }
  lense_type {
    type
  }
  prescription {
    id
    right_sph
    right_cyl
    right_axis
    right_add
    left_sph
    left_cyl
    left_axis
    left_add
    pupillary_distance
  }
  paymentCollection {
    edges {
      node {
        total_payment
        advance
        discount
        additional_fee
      }
    }
  }
  clinic_attend_customer {
    customer_has_branch {
      branch {
        id
        branch_name
      }
      customer {
        id
        first_name
        last_name
        contact_no
        address
      }
    }
  }
`;

// Search #1: by Order / Tracking ID — direct filter on order.id
const GET_ORDER_BY_ID = gql`
  query GetOrderById($orderId: BigInt!) {
    orderCollection(filter: { id: { eq: $orderId } }) {
      edges {
        node {
          ${ORDER_FIELDS}
        }
      }
    }
  }
`;

// Search #2: by mobile number — filter on customer.contact_no (customer's own
// column), then walk the reverse relations back down to orders.
const GET_ORDERS_BY_PHONE = gql`
  query GetOrdersByPhone($phone: String!) {
    customerCollection(filter: { contact_no: { eq: $phone } }) {
      edges {
        node {
          customer_has_branchCollection {
            edges {
              node {
                clinic_attend_customerCollection {
                  edges {
                    node {
                      orderCollection {
                        edges {
                          node {
                            ${ORDER_FIELDS}
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Search #3: by customer name — case-insensitive partial match on either
// name column, same reverse-relation walk as the phone search.
const GET_ORDERS_BY_NAME = gql`
  query GetOrdersByName($pattern: String!) {
    customerCollection(
      filter: {
        or: [
          { first_name: { ilike: $pattern } }
          { last_name: { ilike: $pattern } }
        ]
      }
    ) {
      edges {
        node {
          customer_has_branchCollection {
            edges {
              node {
                clinic_attend_customerCollection {
                  edges {
                    node {
                      orderCollection {
                        edges {
                          node {
                            ${ORDER_FIELDS}
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const currency = (value) =>
  value == null ? "—" : `Rs. ${Number(value).toLocaleString()}`;

const toTrackingId = (orderId) => `OD${orderId}`;

const parseTrackingId = (input) => {
  const digits = input.replace(/\D/g, "");
  return digits.length ? digits : null;
};

// ── Search bar validation ────────────────────────────────────────────────────
// Sri Lankan mobile/landline numbers: optional +94 or leading 0, then 9 digits.
const PHONE_REGEX = /^(?:\+94|0)\d{9}$/;
// Order / tracking id: optional "OD" prefix, then 1-10 digits.
const ORDER_ID_REGEX = /^(od)?\s?\d{1,10}$/i;
// Customer name: letters (incl. accented), spaces, hyphens, apostrophes, 2+ chars.
const NAME_REGEX = /^[A-Za-z\u00C0-\u017F][A-Za-z\u00C0-\u017F\s'-]{1,}$/;

/** Returns an error message for the given mode/value, or null if valid. */
function validateQuery(mode, rawValue) {
  const value = rawValue.trim();

  if (!value) {
    return "This field is required.";
  }

  if (mode === MODE_ORDER) {
    if (!ORDER_ID_REGEX.test(value)) {
      return "Enter a valid order ID, e.g. OD1234 or 1234.";
    }
  } else if (mode === MODE_PHONE) {
    const cleaned = value.replace(/[\s-]/g, "");
    if (!PHONE_REGEX.test(cleaned)) {
      return "Enter a valid phone number, e.g. 0771234567.";
    }
  } else if (mode === MODE_NAME) {
    if (!NAME_REGEX.test(value)) {
      return "Enter a valid name (letters only, at least 2 characters).";
    }
  }

  return null;
}

/** Flattens one order node (as returned by any of the 3 queries above) into
 *  a single "Customer Details" row. */
function flattenOrderNode(order) {
  const chb      = order.clinic_attend_customer?.customer_has_branch;
  const customer = chb?.customer;
  const branch   = chb?.branch;
  const payment  = order.paymentCollection?.edges?.[0]?.node;

  const totalAmount = order.total_price ?? 0;
  const advance     = payment?.advance ?? 0;
  const balance     = (payment?.total_payment ?? totalAmount) - advance;

  return {
    id:              order.id,
    orderId:         order.id,
    customerName:    `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
    centerName:      branch?.branch_name ?? "—",
    phone:           customer?.contact_no ?? "—",
    customerAddress: customer?.address ?? "—",
    totalAmount,
    advance,
    balance,
    frameType:       order.frame_type?.type ?? "—",
    lensType:        order.lense_type?.type ?? "—",
    placedAt:        order.placed_at,
    prescription:    order.prescription,
  };
}

/** Unpivots one order's prescription into Right Eye / Left Eye rows.
 *  NOTE: `optometrist` and `rx_status` aren't in the current schema
 *  (vision_expert.prescription has no such columns) — shown as "—" until
 *  those columns are added. */
function buildPrescriptionRows(order, customerName) {
  const pr = order.prescription;
  if (!pr) return [];

  return [
    {
      rowId:        `${pr.id}-R`,
      orderId:      order.id,
      customerName,
      eye:          "Right Eye (OD)",
      sph:          pr.right_sph,
      cyl:          pr.right_cyl,
      axis:         pr.right_axis,
      addPower:     pr.right_add,
      pd:           pr.pupillary_distance,
      optometrist:  "—",
      rxStatus:     "—",
    },
    {
      rowId:        `${pr.id}-L`,
      orderId:      order.id,
      customerName,
      eye:          "Left Eye (OS)",
      sph:          pr.left_sph,
      cyl:          pr.left_cyl,
      axis:         pr.left_axis,
      addPower:     pr.left_add,
      pd:           pr.pupillary_distance,
      optometrist:  "—",
      rxStatus:     "—",
    },
  ];
}

/** Pulls the flat array of order nodes out of whichever query shape ran. */
function extractOrderNodes(mode, data) {
  if (!data) return [];

  if (mode === MODE_ORDER) {
    return (data.orderCollection?.edges ?? []).map((e) => e.node);
  }

  // phone / name: customer -> customer_has_branch -> clinic_attend_customer -> order
  const customers = data.customerCollection?.edges ?? [];
  const orders = [];
  customers.forEach(({ node: customer }) => {
    (customer.customer_has_branchCollection?.edges ?? []).forEach(({ node: chb }) => {
      (chb.clinic_attend_customerCollection?.edges ?? []).forEach(({ node: cac }) => {
        (cac.orderCollection?.edges ?? []).forEach(({ node: order }) => {
          orders.push(order);
        });
      });
    });
  });
  return orders;
}

// ── CustomerLookup ────────────────────────────────────────────────────────────

function CustomerLookup() {
  const [mode, setMode]                 = useState(MODE_ORDER);
  const [query, setQuery]               = useState("OD1234");
  const [validationError, setValidationError] = useState(null);
  const [activeMode, setActiveMode]     = useState(null);
  const [customerRows, setCustomerRows] = useState([]);
  const [prescriptionRows, setPrescriptionRows] = useState([]);
  const [messageApi, contextHolder]     = message.useMessage();

  const [searchByOrderId, { data: orderData, loading: orderLoading, error: orderError }] =
    useLazyQuery(GET_ORDER_BY_ID, { fetchPolicy: "network-only" });
  const [searchByPhone, { data: phoneData, loading: phoneLoading, error: phoneError }] =
    useLazyQuery(GET_ORDERS_BY_PHONE, { fetchPolicy: "network-only" });
  const [searchByName, { data: nameData, loading: nameLoading, error: nameError }] =
    useLazyQuery(GET_ORDERS_BY_NAME, { fetchPolicy: "network-only" });

  const loading = orderLoading || phoneLoading || nameLoading;

  const placeholderByMode = {
    [MODE_ORDER]: "e.g. OD1234",
    [MODE_PHONE]: "e.g. 0771234567",
    [MODE_NAME]:  "e.g. David Kim",
  };

  // ── Rebuild table rows whenever the relevant query resolves ──
  useEffect(() => {
    const err = orderError || phoneError || nameError;
    if (err) {
      console.error(err);
      messageApi.error("Search failed: " + err.message);
      return;
    }

    if (!activeMode) return;

    const data =
      activeMode === MODE_ORDER ? orderData :
      activeMode === MODE_PHONE ? phoneData :
      nameData;

    if (!data) return;

    const orderNodes = extractOrderNodes(activeMode, data);
    const flatRows    = orderNodes.map(flattenOrderNode);

    setCustomerRows(flatRows);
    setPrescriptionRows(
      orderNodes.flatMap((order, i) => buildPrescriptionRows(order, flatRows[i].customerName))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData, phoneData, nameData, orderError, phoneError, nameError, activeMode]);

  // ── Search handler ──
  const runSearch = (rawQuery) => {
    const trimmed = rawQuery.trim();
    const error = validateQuery(mode, trimmed);

    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setActiveMode(mode);

    if (mode === MODE_ORDER) {
      const orderId = parseTrackingId(trimmed);
      searchByOrderId({ variables: { orderId: Number(orderId) } });
    } else if (mode === MODE_PHONE) {
      const cleaned = trimmed.replace(/[\s-]/g, "");
      searchByPhone({ variables: { phone: cleaned } });
    } else {
      searchByName({ variables: { pattern: `%${trimmed}%` } });
    }
  };

  // ── Mode change: reset query/results/error so stale state from a previous
  // search mode never lingers ──
  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setQuery("");
    setValidationError(null);
    setActiveMode(null);
    setCustomerRows([]);
    setPrescriptionRows([]);
  };

  // ── Clear: wipes the input, any validation error, and any results shown ──
  const handleClear = () => {
    setQuery("");
    setValidationError(null);
    setActiveMode(null);
    setCustomerRows([]);
    setPrescriptionRows([]);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    if (validationError) setValidationError(null);
  };

  // ── Columns ──
  const customerColumns = [
    {
      title: "Order ID", dataIndex: "orderId", key: "orderId", width: 100,
      render: (id) => <a>{toTrackingId(id)}</a>,
    },
    { title: "Customer Name", dataIndex: "customerName", key: "customerName", width: 160,
      render: (val) => <Text strong>{val}</Text> },
    { title: "Center Name", dataIndex: "centerName", key: "centerName", width: 140 },
    { title: "Phone Number", dataIndex: "phone", key: "phone", width: 130,
      render: (val) => <a>{val}</a> },
    { title: "Address", dataIndex: "customerAddress", key: "customerAddress", width: 200 },
    { title: "Total Amount", dataIndex: "totalAmount", key: "totalAmount", width: 120,
      render: currency },
    { title: "Advance", dataIndex: "advance", key: "advance", width: 110,
      render: (val) => <Text style={{ color: "#1677ff" }}>{currency(val)}</Text> },
    { title: "Balance", dataIndex: "balance", key: "balance", width: 110,
      render: (val) => (
        <Text style={{ color: val > 0 ? "#cf1322" : "#389e0d" }}>{currency(val)}</Text>
      ) },
    { title: "Frame Type", dataIndex: "frameType", key: "frameType", width: 120 },
    { title: "Lens Type", dataIndex: "lensType", key: "lensType", width: 120 },
  ];

  const prescriptionColumns = [
    {
      title: "Order ID", dataIndex: "orderId", key: "orderId", width: 100,
      render: (id) => <a>{toTrackingId(id)}</a>,
    },
    { title: "Customer Name", dataIndex: "customerName", key: "customerName", width: 160 },
    {
      title: "Eye", dataIndex: "eye", key: "eye", width: 130,
      render: (eye) => <Tag color={eye.startsWith("Right") ? "blue" : "purple"}>{eye}</Tag>,
    },
    { title: "SPH", dataIndex: "sph", key: "sph", width: 80 },
    { title: "CYL", dataIndex: "cyl", key: "cyl", width: 80 },
    { title: "Axis", dataIndex: "axis", key: "axis", width: 80 },
    { title: "Add", dataIndex: "addPower", key: "addPower", width: 80,
      render: (v) => v ?? "—" },
    { title: "PD (mm)", dataIndex: "pd", key: "pd", width: 90 },
    { title: "Optometrist", dataIndex: "optometrist", key: "optometrist", width: 130 },
    { title: "Rx Status", dataIndex: "rxStatus", key: "rxStatus", width: 110 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      {contextHolder}

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-7xl p-10">

        <div className="text-center mb-3">
          <Title level={2} style={{ fontWeight: 800, color: "#1a237e", textTransform: "uppercase" }}>
            Customer Lookup
          </Title>
          <Text type="secondary">Search by order ID, mobile number, or customer name</Text>
        </div>

        <div style={{
          height: "2px",
          background: "linear-gradient(to right, #1a237e, #90caf9)",
          margin: "18px 0 28px",
        }} />

        <div className="rounded-xl p-6 mb-6" style={{ background: "#e8eaf6" }}>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Radio.Group
              value={mode}
              onChange={(e) => handleModeChange(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value={MODE_ORDER}>Order / Tracking ID</Radio.Button>
              <Radio.Button value={MODE_PHONE}>Mobile Number</Radio.Button>
              <Radio.Button value={MODE_NAME}>Customer Name</Radio.Button>
            </Radio.Group>

            <Space.Compact style={{ width: "100%" }}>
              <Input
                size="large"
                value={query}
                onChange={handleQueryChange}
                onPressEnter={() => runSearch(query)}
                placeholder={placeholderByMode[mode]}
                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                status={validationError ? "error" : ""}
                style={{ flex: 1 }}
              />
              <Button
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={handleClear}
                disabled={!query && !activeMode && !validationError}
              >
                Clear
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => runSearch(query)}
                loading={loading}
              >
                Search
              </Button>
            </Space.Compact>

            {validationError && (
              <Text type="danger" style={{ fontSize: 12 }}>
                {validationError}
              </Text>
            )}

            {mode === MODE_ORDER && (
              <Space size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>Try:</Text>
                {QUICK_TRIES.map((t) => (
                  <a
                    key={t}
                    style={{ fontSize: 12 }}
                    onClick={() => { setQuery(t); runSearch(t); }}
                  >
                    {t}
                  </a>
                ))}
              </Space>
            )}
          </Space>
        </div>

        <style>{`
          .lookup-table .ant-table-thead > tr > th {
            background-color: #092258 !important;
            color: white !important;
            font-weight: 600 !important;
            text-align: center;
            white-space: nowrap;
          }
          .lookup-table .ant-table-tbody > tr > td {
            text-align: center;
            white-space: nowrap;
          }
          .lookup-table .ant-table-tbody > tr:hover > td {
            background: #f5f9ff;
          }
        `}</style>

        {activeMode && (
          <>
            <div className="flex items-center gap-2 mt-8 mb-2">
              <SearchOutlined style={{ color: "#1677ff" }} />
              <Title level={4} style={{ margin: 0 }}>Customer Details</Title>
              <Tag color="blue">{customerRows.length} record{customerRows.length !== 1 ? "s" : ""}</Tag>
            </div>
            <Table
              className="lookup-table"
              columns={customerColumns}
              dataSource={customerRows}
              rowKey="orderId"
              loading={orderLoading || phoneLoading || nameLoading}
              pagination={false}
              scroll={{ x: "max-content" }}
              style={{ border: "1px solid #ddd", borderRadius: 8 }}
              locale={{ emptyText: <Empty description="No matching customer found" /> }}
            />

            <div className="flex items-center gap-2 mt-8 mb-2">
              <Title level={4} style={{ margin: 0 }}>Prescription Details</Title>
              <Tag color="purple">
                {prescriptionRows.length} prescription{prescriptionRows.length !== 1 ? "s" : ""}
              </Tag>
            </div>
            <Table
              className="lookup-table"
              columns={prescriptionColumns}
              dataSource={prescriptionRows}
              rowKey="rowId"
              loading={orderLoading || phoneLoading || nameLoading}
              pagination={false}
              scroll={{ x: "max-content" }}
              style={{ border: "1px solid #ddd", borderRadius: 8 }}
              locale={{ emptyText: <Empty description="No prescription on file" /> }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerLookup;
