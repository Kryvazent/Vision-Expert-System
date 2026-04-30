import { Typography, Select, DatePicker, Table } from 'antd';
const { Title, Text } = Typography;

const centers = [
    { value: 'kadawatha', label: 'Kadawatha' },
    { value: 'Kandy', label: 'Kandy' },
    { value: 'Nuwara Eliya', label: 'Nuwara Eliya' },
    { value: 'Mahiyanganaya', label: 'Mahiyanganaya' },
    { value: 'Dambulla', label: 'Dambulla' },
];

const basecolumns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId', width: 150 },
    { title: 'Customer Name', dataIndex: 'customerName', key: 'customerName', width: 180 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 150 },
    { title: 'Customer Address', dataIndex: 'customerAddress', key: 'customerAddress', width: 200 },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 150 },
    { title: 'Paid Amount', dataIndex: 'paidAmount', key: 'paidAmount', width: 150 },
    { title: 'Remaining Amount', dataIndex: 'remainingAmount', key: 'remainingAmount', width: 180 },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 150 },
    { title: 'Delivery Date', dataIndex: 'deliveryDate', key: 'deliveryDate', width: 150 },
    { title: 'Delivery Time', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 150 },
    { title: 'Payment Received', dataIndex: 'paymentReceived', key: 'paymentReceived', width: 170 },
    { title: 'Delivered', dataIndex: 'delivered', key: 'delivered', width: 120 },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', width: 150 },
];

function DailyCollectionTable({
    selectedCenter,
    setSelectedCenter,
    selectedDate,
    setSelectedDate,
    data,
    extraColumns = []
}) {

    const centerLabel =
        centers.find((c) => c.value === selectedCenter)?.label || "Kadawatha";

    const formattedDate =
        selectedDate?.format("D MMM YYYY");

        const columns = [...basecolumns, ...extraColumns];

    return (
        <div className='min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4'>
            <div className='bg-white rounded-3xl shadow-lg w-full max-w-6xl p-10'>

                {/* Header */}
                <div className='text-center mb-3'>
                    <Title level={2} style={{
                        fontWeight: 800,
                        color: "#1a237e",
                        textTransform: 'uppercase'
                    }}>
                        Vision Expert
                    </Title>

                    <Text style={{ fontWeight: 700, fontSize: 15 }}>
                        DAILY COLLECTION SHEET
                    </Text>

                    <Text style={{ display: 'block', marginTop: 6 }}>
                        <b>{centerLabel.toUpperCase()}</b> - {formattedDate}
                    </Text>
                </div>

                {/* Divider */}
                <div style={{
                    height: '2px',
                    background: 'linear-gradient(to right, #1a237e, #90caf9)',
                    margin: '18px 0 28px'
                }} />

                {/* Filters */}
                <div className='rounded-xl p-6 mb-6' style={{ background: '#e8eaf6' }}>
                    <div className='flex gap-8 flex-wrap'>

                        {/* Center */}
                        <div className='flex-1 min-w-48'>
                            <Text strong>Select Center</Text>
                            <Select
                                value={selectedCenter}
                                onChange={setSelectedCenter}
                                options={centers}
                                style={{ width: "100%", height: 44 }}
                            />
                        </div>

                        {/* Date */}
                        <div className='flex-1 min-w-48'>
                            <Text strong>Select Date</Text>
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                style={{ width: "100%", height: 44 }}
                            />
                        </div>

                    </div>
                </div>

                {/* Table Styles */}
                <style>
                    {`
                    .collection-table .ant-table-thead > tr > th {
                        background-color: #092258 !important;
                        color: white !important;
                        font-weight: 600 !important;
                        text-align: center;
                        white-space: nowrap;
                    }

                    .collection-table .ant-table-tbody > tr > td {
                        text-align: center;
                        white-space: nowrap;
                    }

                    .collection-table .ant-table-tbody > tr:hover > td {
                        background: #f5f9ff;
                    }
                    `}
                </style>

                {/* Table */}
                <Table
                    dataSource={data}
                    columns={columns}
                    className='collection-table'
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 'max-content', y: 300 }}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        marginTop: 30
                    }}
                />
            </div>
        </div>
    );
}

export default DailyCollectionTable;