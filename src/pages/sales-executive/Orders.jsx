import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Modal, Row, Space, Tag } from "antd";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";
import { useEffect, useState } from "react";
import { SpectacleVisualization } from "../../component/sales-executive/dashboard/SpectacleVisualization";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

function Orders() {

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const { staff } = useAuth();

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
        },
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
        },
        {
            title: 'Order Status',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (v) => {
                const statusColors = {
                    Active: "green",
                    Hold: "orange",
                    Cancelled: "red",
                    Completed: "green",
                    Pending: "blue",
                };
                return <Tag color={statusColors[v] || "blue"}>{v}</Tag>;
            },
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalPayment',
            key: 'totalPayment',
            render: (value) => value ? `Rs. ${value}` : '-',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    size="small"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        const mappedPrescription = {
                            id: record.orderId,
                            optometrist: "",
                            customerName: record.customerName,
                            date: record.orderDate,
                            pd: record.pd || '',
                            notes: record.notes || '',
                            rightEye: {
                                sphere: record.rightSphere || '-',
                                cylinder: record.rightCylinder || '-',
                                axis: record.rightAxis || '-',
                                add: record.rightAdd || '0.00'
                            },
                            leftEye: {
                                sphere: record.leftSphere || '-',
                                cylinder: record.leftCylinder || '-',
                                axis: record.leftAxis || '-',
                                add: record.leftAdd || '0.00'
                            }
                        };

                        setSelectedPrescription(mappedPrescription);
                        setShowPrescriptionModal(true);
                    }}
                >
                    View Prescription
                </Button>
            )
        }
    ];

    const GET_ORDERS = gql`
        query getOrders($branchId: ID!) {
            customerCollection {
                edges {
                    node {
                        id
                        first_name
                        last_name
                        contact_no
                        customer_has_branchCollection(filter: {branch_id: {eq: $branchId}}) {
                            edges {
                                node {
                                    id
                                    clinic_attend_customerCollection {
                                        edges {
                                            node {
                                                id
                                                clinic {
                                                    id
                                                    date
                                                }
                                                orderCollection {
                                                    edges {
                                                        node {
                                                            id
                                                            placed_at
                                                            total_price
                                                            order_status {
                                                                id
                                                                status
                                                            }
                                                            prescription {
                                                                id
                                                                created_at
                                                                remarks
                                                                right_sph
                                                                right_cyl
                                                                right_axis
                                                                left_sph
                                                                left_cyl
                                                                left_axis
                                                                right_add
                                                                left_add
                                                                pupillary_distance
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

    const [getOrders, { loading, error, data: ordersData }] = useLazyQuery(GET_ORDERS);
    console.log("Orders Data:", ordersData);

    useEffect(() => {
        if (staff?.branch?.id) {
            getOrders({ variables: { branchId: staff?.branch?.id } });
        }
    }, [getOrders, staff]);

    const mapOrdersData = (data) => {
        if (!data?.customerCollection?.edges) return [];

        const rows = [];

        data.customerCollection.edges.forEach((customerEdge) => {
            const customer = customerEdge?.node;
            if (!customer) return;

            const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
            const mobile = customer.contact_no || '-';

            // Loop through customer_has_branch
            customer.customer_has_branchCollection?.edges?.forEach((branchEdge) => {
                const branch = branchEdge?.node;
                if (!branch) return;

                // Loop through clinic_attend_customer
                branch.clinic_attend_customerCollection?.edges?.forEach((clinicAttendEdge) => {
                    const clinicAttend = clinicAttendEdge?.node;
                    if (!clinicAttend) return;

                    const clinicDate = clinicAttend?.clinic?.date || '-';

                    // Loop through orders
                    clinicAttend.orderCollection?.edges?.forEach((orderEdge) => {
                        const order = orderEdge?.node;
                        if (!order) return;

                        const prescription = order?.prescription;

                        rows.push({
                            key: order.id,
                            orderId: order.id,
                            customerName: customerName,
                            mobile: mobile,
                            totalPayment: order?.total_price || '-',
                            orderDate: order.placed_at
                                ? new Date(order.placed_at).toLocaleDateString()
                                : clinicDate,
                            orderStatus: order?.order_status?.status || '-',
                            paymentStatus: '-',
                            totalAmount: '-',

                            // Prescription fields
                            pd: prescription?.pupillary_distance || '-',
                            notes: prescription?.remarks || '',

                            rightSphere: prescription?.right_sph || '-',
                            rightCylinder: prescription?.right_cyl || '-',
                            rightAxis: prescription?.right_axis || '-',
                            rightAdd: prescription?.right_add || '0.00',

                            leftSphere: prescription?.left_sph || '-',
                            leftCylinder: prescription?.left_cyl || '-',
                            leftAxis: prescription?.left_axis || '-',
                            leftAdd: prescription?.left_add || '0.00',
                        });
                    });
                });
            });
        });

        return rows;
    };

    const mappedData = mapOrdersData(ordersData);

    // filtering data on search
    const searchFilteredData = searchText.trim() === ""
        ? mappedData
        : mappedData
            .filter((row) =>
                row.orderId?.toString().toLowerCase().includes(searchText.toLowerCase())
            )
            .sort((row1, row2) => {
                const search = searchText.toLowerCase();
                const row1Exact = row1.orderId?.toString().toLowerCase() === search;
                const row2Exact = row2.orderId?.toString().toLowerCase() === search;

                if (row1Exact && !row2Exact) return -1;
                if (!row1Exact && row2Exact) return 1;

                const row1Index = row1.orderId?.toString().toLowerCase().indexOf(search);
                const row2Index = row2.orderId?.toString().toLowerCase().indexOf(search);

                return row1Index - row2Index;
            });

    // filtering data on status
    const filteredData = filterStatus === "All"
        ? searchFilteredData
        : searchFilteredData.filter(
            (row) => row.orderStatus?.toLowerCase() === filterStatus.toLowerCase()
        );

    return (
        <>
            <div className="m-5">
                <Card
                    title="Orders"
                    extra={
                        <Space wrap>
                            {["All", "Active", "Pending", "Hold", "Cancelled"].map((status) => (
                                <Button
                                    key={status}
                                    size="small"
                                    type={filterStatus === status ? "primary" : "default"}
                                    style={
                                        filterStatus === status
                                            ? { background: "#1677ff", borderColor: "#1677ff" }
                                            : {}
                                    }
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status}
                                </Button>
                            ))}
                        </Space>
                    }
                >

                    <Row>
                        <Col span={10} className="mb-4">
                            <Input
                                size="middle"
                                placeholder="Search by Order ID"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-2">
                        <CustomTable
                            data={filteredData}
                            columns={columns}
                            pageSize={20}
                            loading={loading}
                        />
                    </Row>

                    {error && (
                        <p className="text-red-500 mt-2">
                            Error loading orders: {error.message}
                        </p>
                    )}
                </Card>
            </div>

            <Modal
                title={null}
                open={showPrescriptionModal}
                onCancel={() => {
                    setShowPrescriptionModal(false);
                    setSelectedPrescription(null);
                }}
                footer={[
                    <Button key="print" onClick={() => window.print()}>
                        Print Prescription
                    </Button>,
                    <Button key="close" type="primary" onClick={() => setShowPrescriptionModal(false)}>
                        Close
                    </Button>
                ]}
                width={900}
                centered
                style={{ padding: 0 }}
            >
                {selectedPrescription && (
                    <SpectacleVisualization prescription={selectedPrescription} />
                )}
            </Modal>
        </>
    );
}

export default Orders;