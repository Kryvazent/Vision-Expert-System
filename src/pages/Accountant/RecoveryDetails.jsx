import { Card, Select, Table } from "antd";
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

// ================= GET RECOVERY DETAILS =================

const GET_RECOVERY_DETAILS = gql`
  query {
    orderCollection {
      edges {
        node {
          id
          placed_at
          estimated_delivery
          advance
          total_payment

          clinic_attend_customer {
            id

            customer_has_branch {
              id

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

  // ================= STATE =================

  const [selectedBranch, setSelectedBranch] =
    useState("all");

  // ================= BRANCH QUERY =================

  const { data: branchData } =
    useQuery(GET_BRANCHES);

  // ================= RECOVERY QUERY =================

  const {
    data: recoveryData,
    loading,
    error,
  } = useQuery(GET_RECOVERY_DETAILS);

  // ================= BRANCHES =================

  const branches =
    branchData?.branchCollection?.edges?.map(
      (item) => item.node
    ) || [];

  // ================= OVERDUE ORDERS =================

  const overdueOrders = useMemo(() => {

    if (!recoveryData?.orderCollection?.edges)
      return [];

    const today = new Date();

    return recoveryData.orderCollection.edges

      .map((edge) => {

        const order = edge.node;

        // ================= RELATIONS =================

        const customerBranch =
          order?.clinic_attend_customer?.customer_has_branch;

        const customer =
          customerBranch?.customer;

        const branch =
          customerBranch?.branch;

        // ================= CUSTOMER NAME =================

        const customerName = `
          ${customer?.first_name || ""}
          ${customer?.last_name || ""}
        `.trim();

        // ================= BRANCH NAME =================

        const branchName =
          branch?.branch_name || "Unknown";

        // ================= PAYMENT =================

        const totalAmount =
          order?.total_payment || 0;

        const paidAmount =
          order?.advance || 0;

        const remaining =
          totalAmount - paidAmount;

        // ================= DATE CHECK =================

        const estimatedDate =
          new Date(order.estimated_delivery);

        const isOverdue =
          estimatedDate < today &&
          remaining > 0;

        return {

          key: order.id,

          orderId: `OD${order.id}`,

          customer:
            customerName || "Unknown",

          branch: branchName,

          orderDate: new Date(
            order.placed_at
          ).toLocaleDateString(),

          estimatedDelivery: new Date(
            order.estimated_delivery
          ).toLocaleDateString(),

          totalAmount,

          paidAmount,

          remaining,

          status: isOverdue
            ? "OVERDUE"
            : "OK",
        };
      })

      // ================= ONLY OVERDUE =================

      .filter(
        (item) => item.status === "OVERDUE"
      )

      // ================= FILTER BY BRANCH =================

      .filter((item) => {

        if (selectedBranch === "all")
          return true;

        return (
          item.branch === selectedBranch
        );
      });

  }, [recoveryData, selectedBranch]);

  // ================= TOTAL RECOVERY =================

  const totalRecovery =
    overdueOrders.reduce(
      (sum, item) =>
        sum + item.remaining,
      0
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
      title: "Total Amount",
      dataIndex: "totalAmount",

      render: (value) => (

        <span className="text-blue-600 font-semibold">

          LKR {value.toLocaleString()}

        </span>

      ),
    },

    {
      title: "Paid Amount",
      dataIndex: "paidAmount",

      render: (value) => (

        <span className="text-green-600 font-semibold">

          LKR {value.toLocaleString()}

        </span>

      ),
    },

    {
      title: "Remaining",
      dataIndex: "remaining",

      render: (value) => (

        <span className="text-red-500 font-semibold">

          LKR {value.toLocaleString()}

        </span>

      ),
    },

    {
      title: "Recovery Status",

      render: () => (

        <span className="bg-red-100 text-red-500 px-3 py-1 rounded">

          OVERDUE

        </span>

      ),
    },

  ];

  return (

    <div className="p-6 space-y-6">

      {/* ================= TITLE ================= */}

      <h1 className="text-3xl font-bold">

        Recovery Details

      </h1>

      {/* ================= FILTER CARD ================= */}

      <Card>

        <div className="space-y-3">

          <p className="font-semibold">

            Filter By Branch

          </p>

          <Select
            value={selectedBranch}

            onChange={(value) =>
              setSelectedBranch(value)
            }

            className="w-72"
          >

            <Option value="all">

              All Branches

            </Option>

            {branches.map((branch) => (

              <Option
                key={branch.id}

                value={branch.branch_name}
              >

                {branch.branch_name}

              </Option>

            ))}
          </Select>
        </div>
      </Card>

      {/* ================= TABLE CARD ================= */}

      <Card>

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-2xl font-semibold">

            Overdue Orders

          </h2>

          <div className="text-2xl font-bold">

            Grand Recovery Total:{" "}

            <span className="text-red-500">

              LKR {totalRecovery.toLocaleString()}

            </span>

          </div>
        </div>

        <Table
          columns={columns}

          dataSource={overdueOrders}

          loading={loading}

          pagination={{ pageSize: 5 }}

          scroll={{ x: true }}
        />

        {error && (

          <p className="text-red-500 mt-4">

            Failed to load recovery data

          </p>

        )}
      </Card>
    </div>
  );
}

export default RecoveryDetails;