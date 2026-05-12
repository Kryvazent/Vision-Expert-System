import { Card, Table, Select, Tag } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import dayjs from "dayjs";

// 🔹 GraphQL Query
const GET_PAYMENT_MONITORING = gql`
  query {

    orderCollection {

      edges {

        node {

          id

          placed_at

          total_payment

          advance

          clinic_attend_customer {

            customer_has_branch {

              branch {

                branch_name

              }

              customer {

                id

                first_name

                last_name

              }

            }

          }

        }

      }

    }

  }
`;

const COLORS = [
  "#2563eb",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
];

export default function PaymentMonitoring() {

  // 🔹 State
  const [selectedBranch, setSelectedBranch] =
    useState("all");

  // 🔹 GraphQL
  const {
    data,
    loading,
    error,
  } = useQuery(GET_PAYMENT_MONITORING);

  // 🔹 Convert Data
  const tableData =
    data?.orderCollection?.edges?.map((item, index) => {

      const order = item.node;

      const branch =
        order?.clinic_attend_customer
          ?.customer_has_branch
          ?.branch;

      const customer =
        order?.clinic_attend_customer
          ?.customer_has_branch
          ?.customer;

      const revenue =
        order?.total_payment || 0;

      const paid =
        order?.advance || 0;

      const pending =
        revenue - paid;

      const rate =
        revenue > 0
          ? ((paid / revenue) * 100).toFixed(1)
          : 0;

      return {

        key: index,

        orderId: order?.id,

        customerId: customer?.id,

        customer:
          `${customer?.first_name || ""}
           ${customer?.last_name || ""}`,

        branch:
          branch?.branch_name,

        orderDate:
          order?.placed_at,

        revenue,

        paid,

        pending,

        rate: `${rate}%`,
      };

    }) || [];

  // 🔹 Filter by Branch
  const filteredData =
    selectedBranch === "all"
      ? tableData
      : tableData.filter(
          (item) =>
            item.branch === selectedBranch
        );

  // 🔹 Unique Branches
  const branchOptions = [

    {
      value: "all",
      label: "All Branches",
    },

    ...[
      ...new Set(
        tableData.map((item) => item.branch)
      ),
    ].map((branch) => ({
      value: branch,
      label: branch,
    })),
  ];

  // 🔹 Summary Calculations
  const totalRevenue =
    filteredData.reduce(
      (sum, item) =>
        sum + item.revenue,
      0
    );

  const totalPaid =
    filteredData.reduce(
      (sum, item) =>
        sum + item.paid,
      0
    );

  const totalPending =
    filteredData.reduce(
      (sum, item) =>
        sum + item.pending,
      0
    );

  const totalOrders =
    filteredData.length;

  // 🔹 Chart Data
  const branchMap = {};

  filteredData.forEach((item) => {

    if (!branchMap[item.branch]) {

      branchMap[item.branch] = {

        branch: item.branch,

        revenue: 0,

        paid: 0,

        pending: 0,
      };
    }

    branchMap[item.branch].revenue +=
      item.revenue;

    branchMap[item.branch].paid +=
      item.paid;

    branchMap[item.branch].pending +=
      item.pending;
  });

  const chartData =
    Object.values(branchMap);

  // 🔹 Pie Chart Data
  const pieData =
    chartData.map((item) => ({

      name: item.branch,

      value: item.revenue,
    }));

  // 🔹 Table Columns
  const columns = [

    {
      title: "Order ID",

      dataIndex: "orderId",

      render: (text) => (

        <Tag color="blue">

          ORD-{text}

        </Tag>

      ),
    },

    {
      title: "Customer ID",

      dataIndex: "customerId",

      render: (text) => (

        <Tag color="purple">

          CUS-{text}

        </Tag>

      ),
    },

    {
      title: "Customer",

      dataIndex: "customer",
    },

    {
      title: "Branch",

      dataIndex: "branch",

      render: (text) => (

        <Tag color="processing">

          {text}

        </Tag>

      ),
    },

    {
      title: "Order Date",

      dataIndex: "orderDate",

      render: (text) =>

        dayjs(text).format(
          "DD/MM/YYYY"
        ),
    },

    {
      title: "Total Revenue",

      dataIndex: "revenue",

      render: (val) => (

        <span className="text-blue-600">

          Rs. {val.toLocaleString()}

        </span>

      ),
    },

    {
      title: "Amount Paid",

      dataIndex: "paid",

      render: (val) => (

        <span className="text-green-600">

          Rs. {val.toLocaleString()}

        </span>

      ),
    },

    {
      title: "Pending",

      dataIndex: "pending",

      render: (val) => (

        <span
          className={
            val > 0
              ? "text-red-500"
              : "text-green-600"
          }
        >

          Rs. {val.toLocaleString()}

        </span>

      ),
    },

    {
      title: "Collection Rate",

      dataIndex: "rate",

      render: (text) => (

        <Tag color="green">

          {text}

        </Tag>

      ),
    },

  ];

  // 🔹 Error
  if (error) {

    console.log(error);

    return <p>Error loading payment data</p>;
  }

  return (

    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      {/* 🔹 Header */}
      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Branch-wise Sales & Payment Monitoring
        </h1>

        <Select
          value={selectedBranch}

          onChange={setSelectedBranch}

          className="w-52"

          options={branchOptions}
        />

      </div>

      {/* 🔹 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card>

          <p className="text-gray-500">
            Total Revenue
          </p>

          <h2 className="text-xl font-bold">

            Rs. {totalRevenue.toLocaleString()}

          </h2>

        </Card>

        <Card>

          <p className="text-gray-500">
            Amount Collected
          </p>

          <h2 className="text-xl font-bold">

            Rs. {totalPaid.toLocaleString()}

          </h2>

        </Card>

        <Card>

          <p className="text-gray-500">
            Pending Payments
          </p>

          <h2 className="text-xl font-bold">

            Rs. {totalPending.toLocaleString()}

          </h2>

        </Card>

        <Card>

          <p className="text-gray-500">
            Total Orders
          </p>

          <h2 className="text-xl font-bold">

            {totalOrders}

          </h2>

        </Card>

      </div>

      {/* 🔹 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <Card title="Branch-wise Revenue & Payment Status">

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart data={chartData}>

              <XAxis dataKey="branch" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="revenue"
                fill="#2563eb"
              />

              <Bar
                dataKey="paid"
                fill="#10b981"
              />

              <Bar
                dataKey="pending"
                fill="#ef4444"
              />

            </BarChart>

          </ResponsiveContainer>

        </Card>

        {/* PIE CHART */}
        <Card title="Revenue Distribution by Branch">

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >

                {pieData.map((_, index) => (

                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index % COLORS.length
                      ]
                    }
                  />

                ))}

              </Pie>

            </PieChart>

          </ResponsiveContainer>

        </Card>

      </div>

      {/* 🔹 Detailed Table */}
      <Card title="Detailed Branch Sales Report">

        <Table
          columns={columns}

          dataSource={filteredData}

          loading={loading}

          pagination={{
            pageSize: 5,
          }}
        />

      </Card>

    </div>
  );
}