import { Card, Input, Button, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

export default function OrderFilter() {

  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState(null);

  // 🔹 GraphQL Query
  const GET_ORDERS = gql`
    query {
      orderCollection {
        edges {
          node {
            id
            placed_at
            estimated_delivery
            total_payment
            advance

            order_status {
              status
            }

            clinic_attend_customer {
              customer_has_branch {

                customer {
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

  // 🔹 Fetch Data
  const { data, loading } = useQuery(GET_ORDERS);

  // 🔹 Map Database Data
  const orders =
    data?.orderCollection?.edges?.map((item) => {

      const order = item.node;

      // 🔹 Relations
      const relation =
        order?.clinic_attend_customer
          ?.customer_has_branch;

      const customer =
        relation?.customer;

      const branch =
        relation?.branch;

      // 🔹 Payments
      const paidAmount =
        order?.advance || 0;

      const remaining =
        (order?.total_payment || 0) -
        paidAmount;

      return {

        key: order?.id,

        orderId: `OD${order?.id}`,

        trackingId: `TR-${order?.id}`,

        customer:
          `${customer?.first_name || ""} ${
            customer?.last_name || ""
          }`,

        branch:
          branch?.branch_name || "No Branch",

        orderDate:
          order?.placed_at
            ? new Date(
                order.placed_at
              ).toLocaleDateString()
            : "-",

        deliveryDate:
          order?.estimated_delivery
            ? new Date(
                order.estimated_delivery
              ).toLocaleDateString()
            : "-",

        total:
          order?.total_payment || 0,

        paid:
          paidAmount,

        remaining:
          remaining,

        status:
          order?.order_status?.status ||
          "Pending",

        payment:
          remaining <= 0
            ? "Completed"
            : "Pending",
      };

    }) || [];

  // 🔹 Search Function
  const handleSearch = () => {

    // 🔹 Clean input
    const search =
      searchValue.trim().toLowerCase();

    // 🔹 Empty input = show all orders
    if (!search) {

      setFilteredData(orders);

      return;
    }

    // 🔹 Filter orders
    const result = orders.filter((item) => {

      // 🔹 Raw order id
      const rawOrderId =
        String(item.orderId || "")
          .replace("OD", "")
          .toLowerCase();

      // 🔹 Formatted order id
      const formattedOrderId =
        String(item.orderId || "")
          .toLowerCase();

      // 🔹 Tracking id
      const trackingId =
        String(item.trackingId || "")
          .toLowerCase();

      return (

        rawOrderId.includes(search) ||

        formattedOrderId.includes(search) ||

        trackingId.includes(search)

      );
    });

    setFilteredData(result);
  };

  // 🔹 Table Columns
  const columns = [

    {
      title: "Order ID",
      dataIndex: "orderId",
    },

    {
      title: "Tracking ID",
      dataIndex: "trackingId",
    },

    {
      title: "Customer Name",
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
      title: "Delivery Date",
      dataIndex: "deliveryDate",
    },

    {
      title: "Total Amount",
      dataIndex: "total",

      render: (val) => (

        <span className="text-blue-500 font-medium">
          LKR {val.toLocaleString()}
        </span>

      ),
    },

    {
      title: "Paid Amount",
      dataIndex: "paid",

      render: (val) => (

        <span className="text-green-500 font-medium">
          LKR {val.toLocaleString()}
        </span>

      ),
    },

    {
      title: "Remaining",
      dataIndex: "remaining",

      render: (val) => (

        <span className="text-red-500 font-medium">
          LKR {val.toLocaleString()}
        </span>

      ),
    },

    {
      title: "Order Status",
      dataIndex: "status",

      render: (val) => (

        <span className="bg-blue-100 px-3 py-1 rounded text-blue-600">
          {val}
        </span>

      ),
    },

    {
      title: "Payment Status",
      dataIndex: "payment",

      render: (val) => (

        <span
          className={
            val === "Completed"
              ? "bg-green-100 px-3 py-1 rounded text-green-600"
              : "bg-red-100 px-3 py-1 rounded text-red-600"
          }
        >
          {val}
        </span>

      ),
    },

  ];

  return (

    <div className="p-6 space-y-6">

      {/* 🔹 Search */}
      <Card>

        <div className="space-y-3">

          <p className="font-medium">
            Search by Order ID or Tracking ID
          </p>

          <div className="flex gap-3">

            <Input
              placeholder="Enter ID"
              value={searchValue}
              onChange={(e) =>
                setSearchValue(e.target.value)
              }
              className="max-w-md"
            />

            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Search
            </Button>

          </div>

        </div>

      </Card>

      {/* 🔹 Results */}
      <Card>

        <p className="mb-4 font-medium">
          Found {(filteredData || orders).length} order(s)
        </p>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData || orders}
          pagination={false}
          scroll={{ x: true }}
        />

      </Card>

    </div>
  );
}