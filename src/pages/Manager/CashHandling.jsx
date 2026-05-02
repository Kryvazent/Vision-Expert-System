import React, { useState } from 'react';
import { Table, Select, Button, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  BankOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;



const data2 = [
  {
    key: '1', 
    transactionId: 'TXN001',
    date: '2024-06-01',
    responsiblePerson: 'John Doe',
    totalCash: 'LKR 150,000',
    status: 'approved',   
    bankDeposit: null,
  },
  {
    key: '2',
    transactionId: 'TXN002',
    date: '2024-06-02',
    responsiblePerson: 'Jane Smith',
    totalCash: 'LKR 200,000',
    status: 'pending',
    bankDeposit: null,
  }
];

function CashHandling() {

  const [data, setData] = useState(data2);

   const handleApprove = (key) => {
    setData(prev =>
      prev.map(row => row.key === key ? { ...row, status: 'Approved' } : row)
    );
  };
 
  const handleDepositChange = (key, value) => {
    setData(prev =>
      prev.map(row => row.key === key ? { ...row, depositStatus: value } : row)
    );
  };

  const columns = [
  {
    title: 'Transaction ID',
    dataIndex: 'transactionId',
    key: 'transactionId',
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Responsible Person',
    dataIndex: 'responsiblePerson',
    key: 'responsiblePerson',
  },
  {
    title: 'Total Cash',
    dataIndex: 'totalCash',
    key: 'totalCash',
  },
  {
    title: 'Approve Cash',
    dataIndex: 'status',
    key: 'status',
    render: (status, record) => {
        if (status === 'Approved') {
          return (
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              className="!text-sm !px-3 !py-1 !rounded-full"
            >
              Approved
            </Tag>
          );
        }
        return (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.key)}
            className="!bg-blue-600 !border-blue-600 !rounded-lg !font-semibold !px-6"
          >
            Approve
          </Button>
        );
      },
  },
  {
    title: 'Bank Deposit',
    dataIndex: 'bankDeposit',
    key: 'bankDeposit',
    render: (depositStatus, record) => {
        if (record.status !== 'Approved') {
          return (
            <Tag
              icon={<ClockCircleOutlined />}
              className="!text-sm !px-3 !py-1 !rounded-full !bg-gray-100 !text-gray-500 !border-gray-200"
            >
              Pending Approval
            </Tag>
          );
        }
 
        if (depositStatus === 'Deposited') {
          return (
            <Tag
              icon={<BankOutlined />}
              color="blue"
              className="!text-sm !px-3 !py-1 !rounded-full"
            >
              Deposited
            </Tag>
          );
        }
 
        if (depositStatus === 'NotDeposited') {
          return (
            <Tag
              icon={<CloseCircleOutlined />}
              color="error"
              className="!text-sm !px-3 !py-1 !rounded-full"
            >
              Not Deposited
            </Tag>
          );
        }
 
        return (
          <Select
            placeholder="Select status"
            style={{ width: '100%' }}
            onChange={(val) => handleDepositChange(record.key, val)}
            className="!rounded-lg"
          >
            <Option value="Deposited">
              <span className="flex items-center gap-2">
                <BankOutlined className="text-blue-500" /> Deposited
              </span>
            </Option>
            <Option value="NotDeposited">
              <span className="flex items-center gap-2">
                <CloseCircleOutlined className="text-red-500" /> Not Deposited
              </span>
            </Option>
          </Select>
        );
      },
  },
];

  return (
    <div className=" bg-gray-100 p-10">
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="!mb-0 !text-gray-900">
          Cash Handling
        </Title>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName="!align-middle"
          className="cash-banking-table"
        />
        </div>
        </div>
      </div>
  )
}

export default CashHandling