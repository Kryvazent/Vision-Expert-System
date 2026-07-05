import { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
  Modal,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { normalizeOrderStatus } from "../../const/functions";

const LOAD_ACTIVE_ORDERS = gql`
  query LoadActiveOrders($branchId: Int!) {
    customerCollection {
      edges {
        node {
          id
          first_name
          last_name
          contact_no
          customer_has_branchCollection(
            filter: { branch_id: { eq: $branchId } }
          ) {
            edges {
              node {
                clinic_attend_customerCollection {
                  edges {
                    node {
                      orderCollection {
                        edges {
                          node {
                            id
                            placed_at
                            total_price
                            balance_amount
                            paymentCollection {
                              edges {
                                node {
                                  total_payment
                                  advance
                                  discount
                                  additional_fee
                                }
                              }
                            }
                            order_paymentCollection {
                              edges {
                                node {
                                  amount
                                  payment_method
                                  payment_type
                                }
                              }
                            }
                            order_status {
                              id
                              status
                            }
                            clinic_attend_customer {
                              clinic {
                                date
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: BigInt!, $statusId: BigInt!) {
    updateorderCollection(
      filter: { id: { eq: $orderId } }
      set: { order_status_id: $statusId }
      atMost: 1
    ) {
      records {
        id
      }
    }
  }
`;

const LOAD_ORDER_STATUSES = gql`
  query LoadOrderStatuses {
    order_statusCollection {
      edges {
        node {
          id
          status
        }
      }
    }
  }
`;

const ADD_ORDER_PAYMENT = gql`
  mutation AddOrderPayment(
    $totalPayment: Float!
    $remarks: String!
    $orderId: ID!
    $discount: Float!
    $additionalFee: Float!
    $advance: Float!
  ) {
    insertIntopaymentCollection(
      objects: {
        total_payment: $totalPayment
        remarks: $remarks
        order_id: $orderId
        discount: $discount
        additional_fee: $additionalFee
        advance: $advance
      }
    ) {
      records {
        id
      }
    }
  }
`;

function OrderStatusManagement() {
  const { staff } = useAuth();
  const branchId = Number(staff?.branch?.id ?? staff?.branch_id);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDiscount, setPaymentDiscount] = useState(0);
  const [paymentAdditionalFee, setPaymentAdditionalFee] = useState(0);
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [loadOrders, { data, loading, error }] = useLazyQuery(
    LOAD_ACTIVE_ORDERS,
    {
      fetchPolicy: "network-only",
    },
  );

  const [loadStatuses, { data: statusesData }] = useLazyQuery(
    LOAD_ORDER_STATUSES,
    { fetchPolicy: "network-only" },
  );

  const orderStatuses = useMemo(
    () => statusesData?.order_statusCollection?.edges?.map((edge) => edge.node) || [],
    [statusesData],
  );

  const getStatusId = (names) => {
    const wanted = (Array.isArray(names) ? names : [names]).map(normalizeOrderStatus);
    const match = orderStatuses.find((status) =>
      wanted.includes(normalizeOrderStatus(status.status)),
    );
    return match?.id ? Number(match.id) : null;
  };

  const [updateOrderStatus, { loading: updating }] = useMutation(
    UPDATE_ORDER_STATUS,
    {
      refetchQueries: [
        {
          query: LOAD_ACTIVE_ORDERS,
          variables: { branchId },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const [addOrderPayment, { loading: paymentLoading }] = useMutation(
    ADD_ORDER_PAYMENT,
    {
      refetchQueries: [
        {
          query: LOAD_ACTIVE_ORDERS,
          variables: { branchId },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  useEffect(() => {
    if (branchId) {
      loadOrders({ variables: { branchId } });
    }
  }, [loadOrders, branchId]);

  useEffect(() => {
    if (!data?.customerCollection?.edges) return;
    const rows = [];

    data.customerCollection.edges.forEach(({ node: customer }) => {
      const customerName =
        `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim();
      const contactNo = customer.contact_no;

      customer.customer_has_branchCollection?.edges?.forEach(
        ({ node: branch }) => {
          branch.clinic_attend_customerCollection?.edges?.forEach(
            ({ node: clinicAttend }) => {
              clinicAttend.orderCollection?.edges?.forEach(
                ({ node: orderNode }) => {
                  rows.push({
                    key: orderNode.id,
                    orderId: orderNode.id,
                    customer: customerName,
                    contactNo,
                    placedAt: orderNode.placed_at
                      ? new Date(orderNode.placed_at).toLocaleDateString()
                      : "-",
                    amount: orderNode.total_price ?? 0,
                    balance: Number(orderNode.balance_amount ?? 0),
                    status: orderNode.order_status?.status || "Unknown",
                    payments:
                      orderNode.paymentCollection?.edges?.map(
                        (edge) => edge.node,
                      ) || [],
                    orderPayments:
                      orderNode.order_paymentCollection?.edges?.map(
                        (edge) => edge.node,
                      ) || [],
                  });
                },
              );
            },
          );
        },
      );
    });

    setOrders(rows);
  }, [data]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter(
      (order) => normalizeOrderStatus(order.status) === normalizeOrderStatus(statusFilter),
    );
  }, [orders, statusFilter]);

  const handleChangeStatusClick = (record) => {
    const normalized = normalizeOrderStatus(record.status);
    if (["active", "completed", "delivered", "cancelled", "canceled"].includes(normalized)) {
      message.warning("Delivered, completed, and cancelled orders cannot be changed here.");
      return;
    }

    setSelectedOrder(record);
    if (normalized === "hold") {
      setSelectedStatus("Pending");
    } else if (normalized === "pending") {
      setSelectedStatus("Hold");
    } else {
      setSelectedStatus("Hold");
    }
    setModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedOrder || !selectedStatus) return;

    const statusId = getStatusId(
      selectedStatus === "Cancelled" ? ["Cancelled", "Canceled"] : selectedStatus,
    );

    if (!statusId) {
      message.error(`${selectedStatus} status was not found in the database.`);
      return;
    }

    try {
      if (
        selectedStatus === "Pending" &&
        normalizeOrderStatus(selectedOrder.status) === "hold"
      ) {
        const totalPayment = selectedOrder.amount;
        const paymentResult = await addOrderPayment({
          variables: {
            totalPayment,
            remarks: paymentRemarks || "Payment to reactivate order",
            orderId: Number(selectedOrder.orderId),
            discount: paymentDiscount,
            additionalFee: paymentAdditionalFee,
            advance: paymentAmount,
          },
        });
        if (!paymentResult?.data?.insertIntopaymentCollection?.records?.length > 0) {
          message.error("Failed to add payment. Status change aborted.");
          return;
        }
      }

      const result = await updateOrderStatus({
        variables: { orderId: Number(selectedOrder.orderId), statusId },
      });
      if (result?.data?.updateorderCollection?.records?.length > 0) {
        message.success(
          `Order #${selectedOrder.orderId} status updated to ${selectedStatus}.`,
        );
        setModalOpen(false);
        setSelectedOrder(null);
        setSelectedStatus(null);
        setPaymentAmount(0);
        setPaymentDiscount(0);
        setPaymentAdditionalFee(0);
        setPaymentRemarks("");
        setPaymentMethod("Cash");
      } else {
        message.error("Failed to update order status. No records updated.");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update order status. Please try again.");
    }
  };

  const columns = [
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Contact No", dataIndex: "contactNo", key: "contactNo" },
    { title: "Order Date", dataIndex: "placedAt", key: "placedAt" },
    {
      title: "Total Price",
      dataIndex: "amount",
      key: "amount",
      render: (value) => `Rs. ${Number(value || 0).toLocaleString()}`,
    },
    {
      title: "Paid",
      key: "paid",
      render: (_, record) => {
        const advance = (record.payments || []).reduce(
          (sum, payment) => sum + Number(payment.advance || 0),
          0,
        );
        const collected = (record.orderPayments || []).reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0,
        );
        return `Rs. ${Number(advance + collected).toLocaleString()}`;
      },
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (value) => `Rs. ${Number(value || 0).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        const normalized = normalizeOrderStatus(status);
        if (normalized === "hold") color = "orange";
        if (normalized === "canceled" || normalized === "cancelled") color = "red";
        if (normalized === "pending") color = "blue";
        if (normalized === "delivered" || normalized === "completed") color = "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const normalized = normalizeOrderStatus(record.status);
        const disabled = ["active", "completed", "delivered", "cancelled", "canceled"].includes(normalized);
        return (
          <Button
            type="primary"
            onClick={() => handleChangeStatusClick(record)}
            disabled={disabled}
          >
            Change Status
          </Button>
        );
      },
    },
  ];

  return (
    <div className="m-5">
      <Card title="Order Status Management" bordered={false}>
        <Space style={{ marginBottom: 16 }}>
          <span>Status filter:</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "All", label: "All" },
              { value: "Pending", label: "Pending" },
              { value: "Hold", label: "Hold" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            style={{ minWidth: 160 }}
          />
        </Space>

        <Table
          dataSource={filteredOrders}
          columns={columns}
          loading={loading}
          rowKey="orderId"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title="Confirm Order Status Change"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleConfirmStatusChange}
        okText="Update Status"
        okButtonProps={{ loading: updating || paymentLoading }}
        cancelText="Cancel"
      >
        <p>
          Change order <strong>#{selectedOrder?.orderId}</strong> from{" "}
          <strong>{selectedOrder?.status}</strong> to:
        </p>
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={[
            { value: "Pending", label: "Pending" },
            { value: "Hold", label: "Hold" },
            { value: "Cancelled", label: "Cancel" },
          ]}
          disabled={
            normalizeOrderStatus(selectedOrder?.status) === "active" ||
            normalizeOrderStatus(selectedOrder?.status) === "completed"
          }
          style={{ width: "100%" }}
        />

        {selectedStatus === "Pending" &&
          normalizeOrderStatus(selectedOrder?.status) === "hold" && (
            <div className="mt-4 space-y-4">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <p className="font-semibold">Payment Amount</p>
                  <Input
                    type="number"
                    prefix="Rs."
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  />
                </Col>
                <Col span={12}>
                  <p className="font-semibold">Additional Fee</p>
                  <Input
                    type="number"
                    prefix="Rs."
                    value={paymentAdditionalFee}
                    onChange={(e) =>
                      setPaymentAdditionalFee(Number(e.target.value))
                    }
                  />
                </Col>
                <Col span={12}>
                  <p className="font-semibold">Discount</p>
                  <Input
                    type="number"
                    prefix="Rs."
                    value={paymentDiscount}
                    onChange={(e) => setPaymentDiscount(Number(e.target.value))}
                  />
                </Col>
                <Col span={12}>
                  <p className="font-semibold">Payment Method</p>
                  <Select
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    options={[
                      { value: "Cash", label: "Cash" },
                      { value: "Card", label: "Card" },
                      { value: "Bank Transfer", label: "Bank Transfer" },
                    ]}
                  />
                </Col>
                <Col span={24}>
                  <p className="font-semibold">Remarks</p>
                  <Input
                    value={paymentRemarks}
                    onChange={(e) => setPaymentRemarks(e.target.value)}
                    placeholder="Enter remarks for payment"
                  />
                </Col>
              </Row>
            </div>
          )}
      </Modal>
    </div>
  );
}

export default OrderStatusManagement;
