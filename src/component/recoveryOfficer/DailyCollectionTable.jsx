import { useState } from 'react';
import { Typography, Select,DatePicker, Table } from 'antd';
const { Title, Text } = Typography;
import dayjs from 'dayjs';

const centers = [
    { value: 'kadawatha', label: 'Kadawatha' },
    { value: 'Kandy', label: 'Kandy' },
    { value: 'Nuwara Eliya', label: 'Nuwara Eliya' },
    { value: 'Mahiyanganaya', label: 'Mahiyanganaya' },
    { value: 'Dambulla', label: 'Dambulla' },
];

const data = [
    {
        id: '1',
      orderId: 'ORD-2024-001',
      customerName: 'Kumara Perera',
      phone: '077-1234567',
      branch: 'Main Branch',
      customerAddress: '10 Lake Rd, Colombo 5',
      totalAmount: 15000,
      paidAmount: 5000,
      remainingAmount: 10000,
      dueDate: '2026-02-26',
      deliveryDate: '2026-02-26',
      deliveryTime: '09:00 AM',
      paymentReceived: false,
      delivered: false,
      remarks: '-',
    },
]
const columns = [
    {
        title: 'Order ID',
        dataIndex: 'orderId',
        key: 'orderId',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Customer Name',
        dataIndex: 'customerName',
        key: 'customerName',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Phone',
        dataIndex: 'phone',     
        key: 'phone',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Branch',
        dataIndex: 'branch',    
        key: 'branch',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Customer Address',
        dataIndex: 'customerAddress',
        key: 'customerAddress',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Total Amount',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Paid Amount',
        dataIndex: 'paidAmount',
        key: 'paidAmount',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Remaining Amount',
        dataIndex: 'remainingAmount',
        key: 'remainingAmount',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Due Date',
        dataIndex: 'dueDate',   
        key: 'dueDate',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Delivery Date',
        dataIndex: 'deliveryDate',  
        key: 'deliveryDate',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Delivery Time',
        dataIndex: 'deliveryTime',  
        key: 'deliveryTime',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
        title: 'Payment Received',
        dataIndex: 'paymentReceived',
        key: 'paymentReceived',
        width: '200px',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    }

];

function DailyCollectionTable() {
    const [selectedCenter, setSelectedCenter] = useState('kadawatha');
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const centerLabel =
    centers.find((c) => c.value === selectedCenter)?.label || "Kadawatha";
    const formattedDate = selectedDate ? selectedDate.format("D MM YYYY"): dayjs().format("D MM YYYY");
  return (
    <div className='min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4'>
        <div className='bg-white rounded-3xl shadow-lg w-full max-w-4xl p-10'>
            {/* Table Header */}

            <div className='text-center mb-2'>
                <Title level={2} 
                    style={{fontWeight: '800', 
                    color:"#1a237e", letterSpacing: '2',
                    marginBottom:4,textTransform: 'uppercase'}}>
                    Vision Expert 
                </Title>
                <Text style={{
                    display: 'block',
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: '#333',
                    fontSize: 15,
                }}>
                    DAILY COLLECTION SHEET
                </Text>
                <Text style={{
                    display: 'block',
                    marginTop: 6,
                    color: '#555',
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: 1,
                }}>
                    <span style={{ fontWeight: 700, color:"#222" }}>
                        {centerLabel.toUpperCase()}
                    </span>{" "} - {formattedDate}
                </Text>
            </div>
            {/* Divider */}
            < div style={{
                height: '2px',
                background: 'linear-gradient(to right, #1a237e, #90caf9)',
                margin: '18px 0 28px 0',
            }} />

            {/* Filter Section */}
            <div className='rounded-xl p-6 mb-6' style={{ backgroundColor: '#e8eaf6' }}>
            <div className='flex gap-8 flex-wrap'>
                <div className='flex-1 min-w-48'>
                <Text style={{
                    display: 'block',
                    fontWeight: 600,
                    color: '#333',
                    fontSize: 14,
                    marginBottom: 8,
                }} >
                    Select Center
                </Text>
                <Select  
                    value={selectedCenter}
                    onChange={(val) => setSelectCenter(val)}
                    options={centers}
                    style={{width:"100%", height: 44}}
                    styles={{
                        popup: {root: {zIndex: 9999}},
                    }}/>       
            </div>
            {/* Select Date */}

            <div className='flex-1 min-w-48'>
                <Text style={{
                    display: 'block',
                    fontWeight: 600,    
                    color: '#333',
                    fontSize: 14,
                    marginBottom: 8,
                }} >
                    Select Date
                </Text>
                <DatePicker 
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    style={{width:"100%", height: 44}}
                    /> 
            </div>     
            </div>
        </div>
        
        {/* Table Section */}
        <style>
        {`
                .collection-table.ant-table-thread > tr >th {
                    background-color: #092258 !important;
                    color: white !important;
                    font-weight: 600 !important;
                    letter-spacing: 1px;
                    font-size: 14px;
                    text-align: center;
                    border-right: 1px solid #ddd !important;
                    padding: 12px 8px 
                }
                .collection-table.ant-table-thead > tr > th:last-child {
                    border-right: none !important;
                }
                .collection-table.ant-table-tbody > tr > td {
                    border-right: 1px solid #ddd;
                }
            `}
        </style>
        <Table 
        dataSource={data} 
        columns={columns}
        className='collection-table'
        pagination={false}
        scroll={{x: true, y:300}}
        style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '40px',
        }}
        />
    </div>
</div>
  )
}

export default DailyCollectionTable