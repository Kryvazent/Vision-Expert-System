import { Card, DatePicker, Select, Table } from "antd";

import { useState } from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import dayjs from "dayjs";

const GET_BRANCHES = gql`
  query {
    branchCollection {
      edges {
        node {
          branch_name
        }
      }
    }
  }
`;
const GET_DAILY_SALES = gql`
  query GetDailySales {
    orderCollection {
      edges {
        node {
          id
          placed_at

          paymentCollection {
            edges {
              node {
                advance
              }
            }
          }

          clinic_attend_customer {
            customer_has_branch {
              branch {
                branch_name
              }
            }
          }
        }
      }
    }
  }
`;

export default function DailySales() {
  // selected date
  const today = dayjs().format("YYYY-MM-DD");

const [selectedDate, setSelectedDate] = useState(today);

  // selected branch
  const [selectedBranch, setSelectedBranch] = useState("all");

  // branch data
  const { data: branchData } = useQuery(GET_BRANCHES);

  // sales data
  const { data, loading, error } = useQuery(GET_DAILY_SALES);

  // filter orders
  const filteredOrders =
    data?.orderCollection?.edges?.filter((item) => {
      // branch name
      const branchName =
        item?.node?.clinic_attend_customer?.customer_has_branch?.branch
          ?.branch_name;

      // order date
     const orderDate = dayjs(item?.node?.placed_at).format("YYYY-MM-DD");

      // branch filter
      const branchMatch =
        selectedBranch === "all" ? true : branchName === selectedBranch;

      // date filter
      const dateMatch = orderDate === selectedDate;

      return branchMatch && dateMatch;
    }) || [];

  // grand total
  const grandTotal = filteredOrders.reduce(
  (sum, item) =>
    sum +
    (item?.node?.paymentCollection?.edges?.[0]?.node?.advance || 0),
  0
);

  //table data
  const tableData = filteredOrders.map((item) => ({
  key: item.node.id,

  orderId: `OD${item.node.id}`,

  branch:
    item.node.clinic_attend_customer?.customer_has_branch?.branch
      ?.branch_name,

  orderDate: new Date(item.node.placed_at).toLocaleDateString(),

  advance:
    item.node.paymentCollection?.edges?.[0]?.node?.advance || 0,
}));

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">
      {/* Filter Card */}
      <Card className="rounded-xl">
        {/* Flex Row */}
        <div className="flex flex-wrap gap-6">
          {/* Date */}
          <div className="flex-1 min-w-[250px] space-y-2">
            <p className="font-medium">Select Date</p>

            <DatePicker
              className="w-full"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(date, dateString) => {
                setSelectedDate(dateString);
              }}
            />
          </div>

          {/* Branch */}
          <div className="flex-1 min-w-[250px] space-y-2">
            <p className="font-medium">Filter by Branch</p>

            <Select
              className="w-full"
              placeholder="All Branches"
               value={selectedBranch}
              onChange={(value) => {
                setSelectedBranch(value);
              }}
              options={[
                {
                  value: "all",
                  label: "All Branches",
                },

                ...(branchData?.branchCollection?.edges?.map((b) => ({
                  value: b?.node?.branch_name,

                  label: b?.node?.branch_name,
                })) || []),
              ]}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 mb-4">
          <h2 className="text-2xl font-semibold">Today's Orders</h2>

          <span className="text-gray-600 font-medium">
            {tableData.length} Order(s)
          </span>
        </div>

        <Table
          className="mt-6"
          loading={loading}
          dataSource={tableData}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Order ID",
              dataIndex: "orderId",
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
              title: "Advance Received",
              dataIndex: "advance",
              render: (value) => (
                <span className="text-green-600 font-semibold">
                  LKR {value.toLocaleString()}
                </span>
              ),
            },
          ]}
        />

        {error && <p className="text-red-500 mt-4">{error.message}</p>}
        {/* Grand Total Box */}
        <div className="mt-6 bg-blue-100 p-6 rounded-xl flex justify-end text-lg font-semibold">
          Grand Total:
          <span className="text-green-600 ml-2">
            LKR {grandTotal.toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  );
}
