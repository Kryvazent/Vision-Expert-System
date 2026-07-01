import { Card, Input, Button, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

export default function OrderFilter() {
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // 🔹 GraphQL Query
  const GET_ORDERS = gql`
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
                  total_payment
                }
              }
            }

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
      const relation = order?.clinic_attend_customer?.customer_has_branch;

      const customer = relation?.customer;

      const branch = relation?.branch;

      // 🔹 Payments

      const payment = order?.paymentCollection?.edges?.[0]?.node;

      const totalAmount = Number(order?.total_price) || 0;

      const paidAmount = Number(payment?.total_payment) || 0;

      const remaining = totalAmount - paidAmount;

      return {
        key: order?.id,

        orderId: `OD${order?.id}`,

       

        customer: `${customer?.first_name || ""} ${customer?.last_name || ""}`,

        branch: branch?.branch_name || "No Branch",

        orderDate: order?.placed_at
          ? new Date(order.placed_at).toLocaleDateString()
          : "-",

        deliveryDate: order?.estimated_delivery
          ? new Date(order.estimated_delivery).toLocaleDateString()
          : "-",

        total: totalAmount,

        paid: paidAmount,

        remaining: remaining,

        status: order?.order_status?.status || "Pending",

        payment: remaining <= 0 ? "Completed" : "Pending",
      };
    }) || [];

  // 🔹 Search Function
  const handleSearch = () => {
    // 🔹 Clean input
    const search = searchValue.trim().toLowerCase();

    // 🔹 Empty input = show all orders
    if (!search) {
      setFilteredData(orders);

      return;
    }

    // 🔹 Filter orders
    const result = orders.filter((item) => {
      // 🔹 Raw order id
      const rawOrderId = String(item.orderId || "")
        .replace("OD", "")
        .toLowerCase();

      // 🔹 Formatted order id
      const formattedOrderId = String(item.orderId || "").toLowerCase();

      

      return (
        rawOrderId.includes(search) ||
        formattedOrderId.includes(search) 
        
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

      render: (status) => {
        let style = "bg-gray-100 text-gray-700";

        switch (status?.toLowerCase()) {
          case "completed":
            style = "bg-green-100 text-green-700";
            break;

          case "pending":
            style = "bg-yellow-100 text-yellow-700";
            break;

          case "active":
            style = "bg-blue-100 text-blue-700";
            break;

          case "hold":
            style = "bg-orange-100 text-orange-700";
            break;

          case "canceled":
            style = "bg-red-100 text-red-700";
            break;
        }

        return (
          <span className={`${style} px-3 py-1 rounded font-medium`}>
            {status}
          </span>
        );
      },
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
          <p className="font-medium">Search by Order ID</p>

          <div className="flex gap-3">
            <Input
              placeholder="Enter Order ID (e.g. 31 or OD31)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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
