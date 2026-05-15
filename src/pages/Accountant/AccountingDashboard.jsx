import { Card, Select, DatePicker } from "antd";
import AcStatCard from "./AcStatCard";
const { Option } = Select;
const { RangePicker } = DatePicker;

import { useState } from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

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

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {

    orderCollection {
      edges {
        node {

          id

          placed_at

          estimated_delivery

          advance

          total_payment

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

function AccountantDashboard() {

  // selected branch
  const [selectedBranch, setSelectedBranch] =
    useState("all");

  // selected dates
  const [selectedDates, setSelectedDates] =
    useState([]);

  // branches
  const {
    data,
    loading,
    error
  } = useQuery(GET_BRANCHES);

  // dashboard data
  const {
    data: dashboardData
  } = useQuery(GET_DASHBOARD_DATA);

  // filter orders
  const filteredOrders =
    dashboardData?.orderCollection?.edges?.filter((item) => {

      // branch name
      const branchName =
        item?.node?.clinic_attend_customer
          ?.customer_has_branch
          ?.branch
          ?.branch_name;

      // order date
      const orderDate =
        new Date(item?.node?.placed_at);

      // branch filter
      const branchMatch =
        selectedBranch === "all"
          ? true
          : branchName === selectedBranch;

      // date filter
      let dateMatch = true;

      // if user selected date range
      if (
        selectedDates.length === 2 &&
        selectedDates[0] &&
        selectedDates[1]
      ) {

        const startDate =
          new Date(selectedDates[0]);

        const endDate =
          new Date(selectedDates[1]);

        dateMatch =
          orderDate >= startDate &&
          orderDate <= endDate;
      }

      return branchMatch && dateMatch;

    }) || [];

  // total revenue
  const totalRevenue =
    filteredOrders.reduce(
      (sum, item) =>
        sum + (item?.node?.total_payment || 0),
      0
    );

  // amount received
  const amountReceived =
    filteredOrders.reduce(
      (sum, item) =>
        sum + (item?.node?.advance || 0),
      0
    );

  // pending collections
  const pendingCollections =
    filteredOrders.reduce(
      (sum, item) =>
        sum +
        (
          (item?.node?.total_payment || 0) -
          (item?.node?.advance || 0)
        ),
      0
    );

  // total orders
  const totalOrders =
    filteredOrders.length;

  // previous values
  const previousRevenue = 100000;
  const previousReceived = 80000;
  const previousPending = 20000;
  const previousOrders = 15;

  // percentage calculations
  const revenuePercentage =
    previousRevenue === 0
      ? 0
      : (
          (
            (totalRevenue - previousRevenue) /
            previousRevenue
          ) * 100
        ).toFixed(1);

  const receivedPercentage =
    previousReceived === 0
      ? 0
      : (
          (
            (amountReceived - previousReceived) /
            previousReceived
          ) * 100
        ).toFixed(1);

  const pendingPercentage =
    previousPending === 0
      ? 0
      : (
          (
            (pendingCollections - previousPending) /
            previousPending
          ) * 100
        ).toFixed(1);

  const ordersPercentage =
    previousOrders === 0
      ? 0
      : (
          (
            (totalOrders - previousOrders) /
            previousOrders
          ) * 100
        ).toFixed(1);

  // average delivery time
  const averageDeliveryTime =
    filteredOrders.length === 0
      ? 0
      : (
          filteredOrders.reduce((sum, item) => {

            const placedDate =
              new Date(item?.node?.placed_at);

            const deliveryDate =
              new Date(item?.node?.estimated_delivery);

            const differenceInDays =
              (deliveryDate - placedDate) /
              (1000 * 60 * 60 * 24);

            return sum + differenceInDays;

          }, 0) / filteredOrders.length
        ).toFixed(0);

  // best performing branch
  const branchTotals = {};

  dashboardData?.orderCollection?.edges?.forEach((item) => {

    const branchName =
      item?.node?.clinic_attend_customer
        ?.customer_has_branch
        ?.branch
        ?.branch_name;

    const revenue =
      item?.node?.total_payment || 0;

    if (!branchTotals[branchName]) {
      branchTotals[branchName] = 0;
    }

    branchTotals[branchName] += revenue;

  });

  let bestBranch = "No Data";
  let highestRevenue = 0;

  Object.entries(branchTotals).forEach(([branch, revenue]) => {

    if (revenue > highestRevenue) {

      highestRevenue = revenue;
      bestBranch = branch;
    }

  });

  // completed orders
  const completedOrders =
    filteredOrders.filter((item) => {

      return (
        item?.node?.advance ===
        item?.node?.total_payment
      );

    }).length;

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center">

        {/* Branch Filter */}
        <Select
          defaultValue="all"
          className="w-52"
          onChange={(value) =>
            setSelectedBranch(value)
          }
        >

          <Option value="all">
            All Branches
          </Option>

          {data?.branchCollection?.edges
  ?.filter(
    (b) =>
      b.node.branch_name !== "Main Branch"
  )
  ?.map((b) => (

    <Option
      key={b.node.branch_name}
      value={b.node.branch_name}
    >

      {b.node.branch_name}

    </Option>
))}

        </Select>

        {/* Date Filter */}
        <RangePicker
          className="w-64"

          onChange={(dates, dateStrings) => {

            setSelectedDates(dateStrings);

          }}
        />

      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-6 justify-center">

        {/* Card 1 */}
        <Card className="w-[40%] rounded-xl shadow-sm">

          <p className="text-gray-500">
            Total Revenue
          </p>

          <h2 className="text-2xl font-bold">
            Rs. {totalRevenue.toLocaleString()}
          </h2>

          <AcStatCard
            iconType="dollar"
            className="absolute top-4 right-4"
          />

          <p
            className={`font-medium ${
              revenuePercentage >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {revenuePercentage >= 0 ? "+" : ""}
            {revenuePercentage}%
          </p>

        </Card>

        {/* Card 2 */}
        <Card className="w-[40%] rounded-xl shadow-sm">

          <p className="text-gray-500">
            Amount Received
          </p>

          <h2 className="text-2xl font-bold">
            Rs. {amountReceived.toLocaleString()}
          </h2>

          <AcStatCard
            iconType="wallet"
            className="absolute top-4 right-4"
          />

          <p
            className={`font-medium ${
              receivedPercentage >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {receivedPercentage >= 0 ? "+" : ""}
            {receivedPercentage}%
          </p>

        </Card>

        {/* Card 3 */}
        <Card className="w-[40%] rounded-xl shadow-sm">

          <p className="text-gray-500">
            Pending Collections
          </p>

          <h2 className="text-2xl font-bold">
            Rs. {pendingCollections.toLocaleString()}
          </h2>

          <AcStatCard
            iconType="creditcard"
            className="absolute top-4 right-4"
          />

          <p
            className={`font-medium ${
              pendingPercentage >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {pendingPercentage >= 0 ? "+" : ""}
            {pendingPercentage}%
          </p>

        </Card>

        {/* Card 4 */}
        <Card className="w-[40%] rounded-xl shadow-sm">

          <p className="text-gray-500">
            Total Orders
          </p>

          <h2 className="text-2xl font-bold">
            {totalOrders}
          </h2>

          <AcStatCard
            iconType="shopping"
            className="absolute top-4 right-4"
          />

          <p
            className={`font-medium ${
              ordersPercentage >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {ordersPercentage >= 0 ? "+" : ""}
            {ordersPercentage}%
          </p>

        </Card>

      </div>

      <div className="flex justify-center">
        <h2>Branch Performance Analysis</h2>
      </div>

      <div className="flex flex-wrap gap-6 justify-center">

        {/* Average Delivery */}
        <Card className="w-[40%] rounded-xl shadow-sm">

          <p className="text-gray-500">
            Average Delivery Time
          </p>

          <h2 className="text-2xl font-bold">
            {averageDeliveryTime} days
          </h2>

          <AcStatCard
            iconType="clock"
            className="absolute top-4 right-4"
          />

          <p className="text-green-500 font-medium">
            Delivery Analysis
          </p>

        </Card>

        {/* Best Branch */}
        <Card className="w-[40%] rounded-xl shadow-sm">

          <p className="text-gray-500">
            Best Performing Branch
          </p>

          <h2 className="text-2xl font-bold">
            {bestBranch}
          </h2>

          <AcStatCard
            iconType="trophy"
            className="absolute top-4 right-4"
          />

          <p className="text-green-500 font-medium">
            Highest Revenue
          </p>

        </Card>

        {/* Completed Orders */}
        <Card className="w-[40%] rounded-xl shadow-sm">

          <p className="text-gray-500">
            Orders Completed
          </p>

          <h2 className="text-2xl font-bold">
            {completedOrders}
          </h2>

          <AcStatCard
            iconType="check"
            className="absolute top-4 right-4"
          />

          <p className="text-green-500 font-medium">
            Fully Paid Orders
          </p>

        </Card>

      </div>
    </div>
  );
}

export default AccountantDashboard;