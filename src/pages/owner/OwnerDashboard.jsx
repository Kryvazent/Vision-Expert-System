import { Card } from "antd";

import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

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
  CartesianGrid,
} from "recharts";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_OWNER_DASHBOARD = gql`
  query GetOwnerDashboard {

    orderCollection {
      edges {
        node {

          id

          advance

          total_payment

          placed_at

          clinic_attend_customer {

            customer_has_branch {

              customer {
                id
              }

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

export default function OwnerDashboard() {

  const {
    data,
    loading,
    error
  } = useQuery(GET_OWNER_DASHBOARD);

  const orders =
    data?.orderCollection?.edges || [];

  // total revenue
  const totalRevenue =
    orders.reduce(
      (sum, item) =>
        sum + (item?.node?.total_payment || 0),
      0
    );

  // total orders
  const totalOrders =
    orders.length;

  // total customers
  const uniqueCustomers = new Set(

    orders.map(

      (item) =>

        item?.node?.clinic_attend_customer
          ?.customer_has_branch
          ?.customer
          ?.id

    )

  );

  const totalCustomers =
    uniqueCustomers.size;

  // pending payments
  const pendingPayments =
    orders.reduce(
      (sum, item) =>
        sum +
        (
          (item?.node?.total_payment || 0) -
          (item?.node?.advance || 0)
        ),
      0
    );

  // branch performance
  const branchTotals = {};

  orders.forEach((item) => {

    const branch =

      item?.node?.clinic_attend_customer
        ?.customer_has_branch
        ?.branch
        ?.branch_name;

    const total =
      item?.node?.total_payment || 0;

    if (!branchTotals[branch]) {

      branchTotals[branch] = 0;

    }

    branchTotals[branch] += total;

  });

  const branchChartData =

    Object.entries(branchTotals).map(

      ([branch, revenue]) => ({

        branch,
        revenue,

      })

    );

  // payment overview
  const paymentOverviewData = [

    {
      name: "Received",

      value: orders.reduce(

        (sum, item) =>

          sum + (item?.node?.advance || 0),

        0
      ),
    },

    {
      name: "Pending",
      value: pendingPayments,
    },

  ];

  // dummy product data
  const productDistribution = [

    {
      name: "Frames",
      value: 40,
    },

    {
      name: "Lenses",
      value: 35,
    },

    {
      name: "Accessories",
      value: 25,
    },

  ];

  // best branch
  let bestBranch = "No Data";

  let highestRevenue = 0;

  Object.entries(branchTotals).forEach(

    ([branch, revenue]) => {

      if (revenue > highestRevenue) {

        highestRevenue = revenue;

        bestBranch = branch;

      }

    }

  );

  // completed orders
  const completedOrders =

    orders.filter((item) => {

      return (

        item?.node?.advance ===
        item?.node?.total_payment

      );

    }).length;

  if (loading) {

    return <p>Loading...</p>;

  }

  if (error) {

    console.log(error);

    return <p>Error loading dashboard</p>;

  }

  return (

    <div className="h-[calc(100vh-90px)] overflow-y-auto space-y-10 pr-2 mx-5 mt-5">

      {/* TOP CARDS */}
      <div className="flex flex-wrap gap-4">

        {/* Revenue */}
        <Card className="flex-1 min-w-[250px] relative">

          <DollarOutlined
            className="absolute right-4 top-4"
            style={{
              color: "#22c55e",
              fontSize: 22,
            }}
          />

          <p className="text-gray-500">
            Total Revenue
          </p>

          <h2 className="text-2xl font-bold">

            Rs. {totalRevenue.toLocaleString()}

          </h2>

          <p className="text-green-500">

            Business Revenue

          </p>

        </Card>

        {/* Orders */}
        <Card className="flex-1 min-w-[250px] relative">

          <ShoppingOutlined
            className="absolute right-4 top-4"
            style={{
              color: "#3b82f6",
              fontSize: 22,
            }}
          />

          <p className="text-gray-500">

            Total Orders

          </p>

          <h2 className="text-2xl font-bold">

            {totalOrders}

          </h2>

          <p className="text-green-500">

            Active Orders

          </p>

        </Card>

        {/* Customers */}
        <Card className="flex-1 min-w-[250px] relative">

          <UserOutlined
            className="absolute right-4 top-4"
            style={{
              color: "#f59e0b",
              fontSize: 22,
            }}
          />

          <p className="text-gray-500">

            Total Customers

          </p>

          <h2 className="text-2xl font-bold">

            {totalCustomers}

          </h2>

          <p className="text-green-500">

            Registered Customers

          </p>

        </Card>

        {/* Pending */}
        <Card className="flex-1 min-w-[250px] relative">

          <CreditCardOutlined
            className="absolute right-4 top-4"
            style={{
              color: "#ef4444",
              fontSize: 22,
            }}
          />

          <p className="text-gray-500">

            Pending Payments

          </p>

          <h2 className="text-2xl font-bold">

            Rs. {pendingPayments.toLocaleString()}

          </h2>

          <p className="text-red-500">

            Outstanding Balance

          </p>

        </Card>

      </div>

      {/* CHARTS */}
      <div className="flex flex-wrap gap-4">

        {/* Payment Chart */}
        <Card className="flex-1 min-w-[350px]">

          <h2 className="font-semibold mb-4">

            Payments Overview

          </h2>

          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <PieChart>

              <Pie
                data={paymentOverviewData}
                dataKey="value"
                outerRadius={80}
                label
              >

                {paymentOverviewData.map((entry, index) => (

                  <Cell
                    key={index}
                    fill={
                      index === 0
                        ? "#22c55e"
                        : "#ef4444"
                    }
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </Card>

        {/* Branch Chart */}
        <Card className="flex-1 min-w-[350px]">

          <h2 className="font-semibold mb-4">

            Branch Performance

          </h2>

          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <BarChart data={branchChartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="branch" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="revenue"
                fill="#3b82f6"
              />

            </BarChart>

          </ResponsiveContainer>

        </Card>

      </div>

      {/* BOTTOM SECTION */}
      <div className="flex flex-wrap gap-4">

        {/* Product Distribution */}
        <Card className="flex-1 min-w-[350px]">

          <h2 className="font-semibold mb-4">

            Product Distribution

          </h2>

          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <PieChart>

              <Pie
                data={productDistribution}
                dataKey="value"
                outerRadius={80}
                label
              >

                {productDistribution.map((entry, index) => (

                  <Cell
                    key={index}
                    fill={[
                      "#3b82f6",
                      "#22c55e",
                      "#f59e0b",
                    ][index]}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </Card>

        {/* Branch Overview */}
        <Card className="flex-1 min-w-[350px] space-y-4">

          <h2 className="font-semibold">

            Branch Overview

          </h2>

          {branchChartData.map((branch) => (

            <div key={branch.branch}>

              <div className="flex justify-between text-sm">

                <span>
                  {branch.branch}
                </span>

                <span>

                  Rs. {branch.revenue.toLocaleString()}

                </span>

              </div>

              <div className="w-full bg-gray-200 h-2 rounded mt-1">

                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{
                    width: `${branch.revenue / 1000}%`,
                  }}
                ></div>

              </div>

            </div>

          ))}

        </Card>

      </div>

      {/* INSIGHTS */}
      <Card>

        <h2 className="font-semibold mb-4">

          Business Insights & Alerts

        </h2>

        <div className="flex flex-wrap gap-4">

          {/* Best Branch */}
          <div className="bg-green-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">

            <TrophyOutlined
              style={{
                color: "#22c55e",
                fontSize: 22,
              }}
            />

            <div>

              <p className="font-medium">

                Best Branch

              </p>

              <p className="text-sm">

                {bestBranch} generated highest revenue

              </p>

            </div>

          </div>

          {/* Pending */}
          <div className="bg-yellow-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">

            <WarningOutlined
              style={{
                color: "#eab308",
                fontSize: 22,
              }}
            />

            <div>

              <p className="font-medium">

                Pending Payments

              </p>

              <p className="text-sm">

                Rs. {pendingPayments.toLocaleString()} pending

              </p>

            </div>

          </div>

          {/* Customer */}
          <div className="bg-green-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">

            <RiseOutlined
              style={{
                color: "#22c55e",
                fontSize: 22,
              }}
            />

            <div>

              <p className="font-medium">

                Customer Growth

              </p>

              <p className="text-sm">

                {totalCustomers} active customers

              </p>

            </div>

          </div>

          {/* Completed */}
          <div className="bg-blue-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">

            <CheckCircleOutlined
              style={{
                color: "#3b82f6",
                fontSize: 22,
              }}
            />

            <div>

              <p className="font-medium">

                Completed Orders

              </p>

              <p className="text-sm">

                {completedOrders} fully completed

              </p>

            </div>

          </div>

        </div>

      </Card>

    </div>

  );
}