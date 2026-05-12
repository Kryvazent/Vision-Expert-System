import { Card, Table, Select, DatePicker, Tag } from "antd";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const GET_SYSTEM_ACTIVITY = gql`
  query {

    orderCollection(orderBy: [{ placed_at: DescNullsLast }]) {

      edges {

        node {

          id

          placed_at

          total_payment

          advance

          clinic_attend_customer {

            customer_has_branch {

              customer {

                id

                first_name

                last_name

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

export default function SystemActivity() {

  // 🔹 States
  const [selectedBranch, setSelectedBranch] =
    useState("all");

  const [selectedDates, setSelectedDates] =
    useState([]);

  // 🔹 GraphQL
  const {
    data,
    loading,
    error
  } = useQuery(GET_SYSTEM_ACTIVITY);

  // 🔹 Convert GraphQL Data
  const tableData =
    data?.orderCollection?.edges?.map((item, index) => {

      const order = item.node;

      const customer =
        order?.clinic_attend_customer
          ?.customer_has_branch
          ?.customer;

      const branch =
        order?.clinic_attend_customer
          ?.customer_has_branch
          ?.branch;

      // 🔹 Activity Logic
      let action = "Created Order";

      let module = "Orders";

      if (order.advance < order.total_payment) {

        action = "Pending Payment";

        module = "Payments";

      }

      if (order.advance === order.total_payment) {

        action = "Completed Payment";

        module = "Payments";

      }

      return {

        key: index,

        orderId: order?.id,

        customerId: customer?.id,

        customer:
          `${customer?.first_name || ""}
           ${customer?.last_name || ""}`,

        action,

        module,

        branch: branch?.branch_name,

        datetime: order?.placed_at,
      };

    }) || [];

  // 🔹 Filter Data
  const filteredData = tableData.filter((item) => {

    // 🔹 Branch Filter
    const branchMatch =
      selectedBranch === "all"
        ? true
        : item.branch === selectedBranch;

    // 🔹 Date Filter
    let dateMatch = true;

    if (selectedDates?.length === 2) {

      const start =
        dayjs(selectedDates[0]).startOf("day");

      const end =
        dayjs(selectedDates[1]).endOf("day");

      dateMatch =
        dayjs(item.datetime).isAfter(start) &&
        dayjs(item.datetime).isBefore(end);
    }

    return branchMatch && dateMatch;

  });

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

  // 🔹 Table Columns
  const columns = [

    // ORDER ID
    {
      title: "Order ID",

      dataIndex: "orderId",

      render: (text) => (

        <Tag color="blue">

          ORD-{text}

        </Tag>

      ),
    },

    // CUSTOMER ID
    {
      title: "Customer ID",

      dataIndex: "customerId",

      render: (text) => (

        <Tag color="purple">

          CUS-{text}

        </Tag>

      ),
    },

    // CUSTOMER
    {
      title: "Customer",

      dataIndex: "customer",
    },

    // ACTION
    {
      title: "Action",

      dataIndex: "action",

      render: (text) => {

        let color = "blue";

        if (text === "Pending Payment") {

          color = "red";

        }

        if (text === "Completed Payment") {

          color = "green";

        }

        return (

          <Tag color={color}>

            {text}

          </Tag>

        );
      },
    },

    // MODULE
    {
      title: "Module",

      dataIndex: "module",
    },

    // BRANCH
    {
      title: "Branch",

      dataIndex: "branch",

      render: (text) => (

        <Tag color="processing">

          {text}

        </Tag>

      ),
    },

    // DATE TIME
    {
      title: "Date & Time",

      dataIndex: "datetime",

      render: (text) =>

        dayjs(text).format(
          "DD/MM/YYYY hh:mm A"
        ),
    },

  ];

  // 🔹 Error
  if (error) {

    console.log(error);

    return <p>Error loading activity</p>;

  }

  return (

    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      {/* 🔹 Card */}
      <Card>

        {/* 🔹 Filters */}
        <div className="flex flex-wrap gap-4 mb-4">

          {/* Branch Filter */}
          <Select
            value={selectedBranch}

            onChange={setSelectedBranch}

            className="w-56"

            options={branchOptions}
          />

          {/* Date Filter */}
          <RangePicker
            className="w-72"

            onChange={(dates) =>

              setSelectedDates(dates)

            }
          />

        </div>

        {/* 🔹 Table */}
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