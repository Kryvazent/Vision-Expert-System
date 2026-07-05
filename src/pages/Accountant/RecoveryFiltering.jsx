import { Card, DatePicker, Select, Table, Input } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
const { Option } = Select;

import { gql } from "@apollo/client";
import { useLazyQuery, useQuery } from "@apollo/client/react";
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

const GET_RECOVERY_DATA = gql`
  query GetRecoveryData($date: Date!) {
    orderCollection(filter: { estimated_delivery: { gte: $date } }) {
      edges {
        node {
          id

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
              }
            }
          }

          order_status {
            status
          }

          clinic_attend_customer {
            customer_has_branch {
              branch {
                branch_name
              }

              customer {
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

function RecoveryFiltering() {
  // Today's date
  const today = new Date().toISOString().split("T")[0];

  // States
  const [selectedDate, setSelectedDate] = useState(today);

  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const [customerSearch, setCustomerSearch] = useState("");

  const [branchSearch, setBranchSearch] = useState("");

  // GraphQL Queries
  const [fetchRecoveryData, { data, loading, error }] =
    useLazyQuery(GET_RECOVERY_DATA);

  const { data: branchData } = useQuery(GET_BRANCHES);

  // Load today's recovery orders
  useEffect(() => {
    fetchRecoveryData({
      variables: {
        date: today,
      },
    });
  }, [fetchRecoveryData, today]);

  // Branch list
  const branches =
    branchData?.branchCollection?.edges?.map((item) => item.node) || [];

  // Table data
  const tableData = (data?.orderCollection?.edges || [])

    .map((item, index) => {
      const order = item.node;

      const customerData = order?.clinic_attend_customer?.customer_has_branch;

      // Payment
      const payment = order?.paymentCollection?.edges?.[0]?.node;

      const advance = Number(payment?.advance) || 0;

      const deliveryPayments =
        order?.delivery_orderCollection?.edges?.reduce(
          (sum, item) => sum + (Number(item?.node?.paid_amount) || 0),
          0,
        ) || 0;

      const paidAmount = advance + deliveryPayments;

      const totalAmount = Number(order?.total_price) || 0;

      const paymentCompleted = paidAmount >= totalAmount;

      // Order Status
      const orderStatus = order?.order_status?.status || "";

      // Delivery Date
      const estimatedDate = dayjs(order?.estimated_delivery);

      const daysRemaining = estimatedDate
        .startOf("day")
        .diff(dayjs().startOf("day"), "day");

      // Status
      const status = daysRemaining <= 3 ? "Due Soon" : "Upcoming";

      return {
        key: index,

        id: order.id,

        name: `${customerData?.customer?.first_name || ""} ${
          customerData?.customer?.last_name || ""
        }`,

        mobile: customerData?.customer?.contact_no,

        branch: customerData?.branch?.branch_name,

        estimatedDelivery: estimatedDate.format("DD/MM/YYYY"),

        daysRemaining,

        status,

        paymentCompleted,

        orderStatus,
      };
    })

    .filter((item) => {
      // Hide only if payment AND order are completed
      const recoveryFilter = item.orderStatus.toLowerCase() !== "delivered";

      // Branch Filter
      const branchFilter =
        selectedBranch === "All Branches"
          ? true
          : item.branch === selectedBranch;

      // Customer Search
      const customerFilter = item.name
        .toLowerCase()
        .includes(customerSearch.toLowerCase());

      // Branch Search
      const branchSearchFilter = item.branch
        .toLowerCase()
        .includes(branchSearch.toLowerCase());

      return (
        recoveryFilter && branchFilter && customerFilter && branchSearchFilter
      );
    });

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">
      <Card className="rounded-xl">
        {/* TITLE */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upcoming Recoveries</h1>

          <p className="text-gray-500 mt-1">
            View upcoming customer payments based on estimated delivery dates.
          </p>
        </div>

        {/* SEARCH INPUTS */}

        <div className="flex flex-wrap gap-4 mb-6">
          {/* CUSTOMER SEARCH */}

          <div>
            <p className="mb-2 font-medium">Search Customer</p>

            <Input
              placeholder="Search Customer Name"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-52"
            />
          </div>

          {/* BRANCH SEARCH */}

          <div>
            <p className="mb-2 font-medium">Search Branch</p>

            <Input
              placeholder="Search Branch Name"
              value={branchSearch}
              onChange={(e) => setBranchSearch(e.target.value)}
              className="w-52"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mb-4">
          {/* DATE FILTER */}

          <div className="flex-1 min-w-[250px]">
            <p className="mb-2 font-medium">Filter by Date</p>

            <DatePicker
              className="w-full"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(date, dateString) => {
                // save selected date
                setSelectedDate(dateString);

                // run query
                if (dateString) {
                  fetchRecoveryData({
                    variables: {
                      date: dateString,
                    },
                  });
                }
              }}
            />
          </div>

          {/* BRANCH FILTER */}

          <div className="flex-1 min-w-[250px]">
            <p className="mb-2 font-medium">Filter by Branch</p>

            <Select
              className="w-full"
              value={selectedBranch}
              onChange={(value) => setSelectedBranch(value)}
            >
              <Option value="All Branches">All Branches</Option>

              {branches?.map((branch) => (
                <Option key={branch.id} value={branch.branch_name}>
                  {branch.branch_name}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* TABLE */}

        <Table
          loading={loading}
          columns={[
            {
              title: "Order ID",
              dataIndex: "id",
            },

            {
              title: "Customer Name",
              dataIndex: "name",
            },

            {
              title: "Mobile",
              dataIndex: "mobile",
            },

            {
              title: "Branch",
              dataIndex: "branch",
            },
            {
              title: "Estimated Delivery",
              dataIndex: "estimatedDelivery",
            },
            {
              title: "Days Remaining",
              dataIndex: "daysRemaining",

              render: (days) => (
                <span className="text-blue-600 font-semibold">
                  {days} {days === 1 ? "day" : "days"}
                </span>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",

              render: (status) => (
                <span
                  className={
                    status === "Due Soon"
                      ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-medium"
                      : "bg-green-100 text-green-700 px-3 py-1 rounded font-medium"
                  }
                >
                  {status}
                </span>
              ),
            },
          ]}
          dataSource={tableData}
          pagination={{
            pageSize: 5,
          }}
        />

        {error && (
          <p className="text-red-500 mt-4">Failed to load recovery data</p>
        )}
      </Card>
    </div>
  );
}

export default RecoveryFiltering;
