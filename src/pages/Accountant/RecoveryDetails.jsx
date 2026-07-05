import { Card, Select, Table, Input } from "antd";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

const { Option } = Select;

// ================= GET BRANCHES =================
const GET_BRANCHES = gql`
  query {
    branchCollection {
      edges {
        node {
          id
          branch_name
        }
      }
    }
  }
`;
const GET_RECOVERY_DETAILS = gql`
  query {
    orderCollection {
      edges {
        node {
          id
          placed_at
          estimated_delivery
          total_price

          paymentCollection {
            edges {
              node {
                advance
              }
            }
          }

          delivery_orderCollection {
            edges {
              node {
                paid_amount
                balance_amount
                payment_received
                payment_type
                status
              }
            }
          }

          order_status {
            status
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
              }
            }
          }
        }
      }
    }
  }
`;

function RecoveryDetails() {
  // ================= STATES =================

  const [selectedBranch, setSelectedBranch] = useState("all");

  const [customerSearch, setCustomerSearch] = useState("");

  const [branchSearch, setBranchSearch] = useState("");

  // ================= BRANCH QUERY =================

  const { data: branchData } = useQuery(GET_BRANCHES);

  // ================= RECOVERY QUERY =================

  const { data: recoveryData, loading, error } = useQuery(GET_RECOVERY_DETAILS);

  // ================= BRANCHES =================

  const branches =
    branchData?.branchCollection?.edges?.map((item) => item.node) || [];

  // ================= OVERDUE ORDERS =================

  const recoveryOrders = useMemo(() => {
    if (!recoveryData?.orderCollection?.edges) return [];

    const today = new Date();

    return (
      recoveryData.orderCollection.edges

        .map((edge) => {
          const order = edge.node;

          // ================= RELATIONS =================

          const customerBranch =
            order?.clinic_attend_customer?.customer_has_branch;

          const customer = customerBranch?.customer;

          const branch = customerBranch?.branch;

          // ================= CUSTOMER NAME =================

          const customerName = `
          ${customer?.first_name || ""}
          ${customer?.last_name || ""}
        `.trim();

          // ================= BRANCH NAME =================

          const branchName = branch?.branch_name || "Unknown";

          // ================= PAYMENT =================

          const payment = order?.paymentCollection?.edges?.[0]?.node;

          const totalAmount = Number(order?.total_price) || 0;

          // Advance payment
          const advance = Number(payment?.advance) || 0;

          // Sum all delivery payments
          const deliveryPayments =
            order?.delivery_orderCollection?.edges?.reduce(
              (sum, item) => sum + (Number(item.node.paid_amount) || 0),
              0,
            ) || 0;

          // Total amount received
          const paidAmount = advance + deliveryPayments;

          // Outstanding balance
          const remaining = totalAmount - paidAmount;

          // Payment completed
          const paymentCompleted = paidAmount >= totalAmount;

          // ================= ORDER STATUS =================

          const status = order?.order_status?.status || "Unknown";

          const orderCompleted = status.toLowerCase() === "delivered";
          return {
            key: order.id,

            orderId: `OD${order.id}`,

            customer: customerName || "Unknown",

            branch: branchName,

            orderDate: new Date(order.placed_at).toLocaleDateString(),

            estimatedDelivery: new Date(
              order.estimated_delivery,
            ).toLocaleDateString(),

            totalAmount,

            paidAmount,

            remaining,

            status,

            paymentCompleted,

            orderCompleted,
          };
        })

        // ================= RECOVERY FILTER =================

        .filter((item) => {
          // Hide delivered orders only
          return item.status.toLowerCase() !== "delivered";
        })

        // ================= FILTERS =================

        .filter((item) => {
          // branch dropdown filter
          const branchFilter =
            selectedBranch === "all" ? true : item.branch === selectedBranch;

          // customer search
          const customerFilter = item.customer
            .toLowerCase()
            .includes(customerSearch.toLowerCase());

          // branch search
          const branchSearchFilter = item.branch
            .toLowerCase()
            .includes(branchSearch.toLowerCase());

          return branchFilter && customerFilter && branchSearchFilter;
        })
    );
  }, [recoveryData, selectedBranch, customerSearch, branchSearch]);

  // ================= TOTAL RECOVERY =================

  const totalRecovery = recoveryOrders.reduce(
    (sum, item) => sum + item.remaining,
    0,
  );

  // ================= TABLE COLUMNS =================

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
    },

    {
      title: "Customer",
      dataIndex: "customer",
    },

    {
      title: "Branch",
      dataIndex: "branch",
    },

    {
      title: "Order Date",
      dataIndex: "orderDate",
    },

    {
      title: "Estimated Delivery",
      dataIndex: "estimatedDelivery",
    },

    {
      title: "Order Total",
      dataIndex: "totalAmount",

      render: (value) => (
        <span className="text-blue-600 font-semibold">
          LKR {value.toLocaleString()}
        </span>
      ),
    },

    {
      title: "Amount Received",
      dataIndex: "paidAmount",

      render: (value) => (
        <span className="text-green-600 font-semibold">
          LKR {value.toLocaleString()}
        </span>
      ),
    },

    {
      title: "Outstanding Balance",
      dataIndex: "remaining",

      render: (value) => (
        <span className="text-red-500 font-semibold">
          LKR {value.toLocaleString()}
        </span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",

      render: (status) => {
        let className = "px-3 py-1 rounded font-medium";

        switch (status) {
          case "Active":
            className += " bg-blue-100 text-blue-600";
            break;

          case "Confirmed":
            className += " bg-cyan-100 text-cyan-700";
            break;

          case "In Lab":
            className += " bg-purple-100 text-purple-700";
            break;

          case "Ready for Delivery":
            className += " bg-green-100 text-green-700";
            break;

          case "Hold":
            className += " bg-yellow-100 text-yellow-700";
            break;

          case "Cancelled":
            className += " bg-red-100 text-red-600";
            break;

          default:
            className += " bg-gray-100 text-gray-700";
        }

        return <span className={className}>{status}</span>;
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ================= TITLE ================= */}

      <h1 className="text-3xl font-bold">Recovery Details</h1>

      {/* ================= FILTER CARD ================= */}

      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          {/* CUSTOMER SEARCH */}

          <Input
            placeholder="Search Customer Name"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-52"
          />

          {/* BRANCH SEARCH */}

          <Input
            placeholder="Search Branch Name"
            value={branchSearch}
            onChange={(e) => setBranchSearch(e.target.value)}
            className="w-52"
          />

          {/* BRANCH DROPDOWN */}

          <Select
            value={selectedBranch}
            onChange={(value) => setSelectedBranch(value)}
            className="w-52"
          >
            <Option value="all">All Branches</Option>

            {branches?.map((branch) => (
              <Option key={branch.id} value={branch.branch_name}>
                {branch.branch_name}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* ================= TABLE CARD ================= */}

      <Card>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">Recovery Orders</h2>

          <div className="text-2xl font-bold">
            Grand Recovery Total:{" "}
            <span className="text-red-500">
              LKR {totalRecovery.toLocaleString()}
            </span>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={recoveryOrders}
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
        />

        {error && (
          <p className="text-red-500 mt-4">Failed to load recovery data</p>
        )}
      </Card>
    </div>
  );
}

export default RecoveryDetails;
