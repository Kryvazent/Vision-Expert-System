import React, { useState } from 'react'
import {Card, Table, Tag, Select, Button, Space, Badge } from "antd";
import { icons } from '../../../assets/icons/AdminIcons';

const {Option} = Select;

export default function BatchManagementTable() {

  const [data, setData] = useState([
    {
      key : "1",
      batch : "BATCH-2026-001",
      orders : 3,
      status : "Delivered",
      update : "Delivered" ,
      next : "Final Status",
    },
    {
      key : "2",
      batch : "BATCH-2026-002",
      orders : 2,
      status : "Received from the Lab",
      update : "Out for delivery" ,
      next : "next",
    },
    {
      key: "3",
      batch: "BATCH-2026-003",
      orders: 1,
      status: "Delivered to the Lab",
      update: "Delivered to the Lab",
      next: "Next",
    },
    {
      key: "4",
      batch: "BATCH-2026-004",
      orders: 4,
      status: "Confirmations Completed",
      update: "Confirmations Completed",
      next: "Next",
    },
    {
      key: "5",
      batch: "BATCH-2026-005",
      orders: 2,
      status: "Pending Customer Confirmation",
      update: "Pending Customer Confirmation",
      next: "Next",
    },
  ]);

  const getStatusTag = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <Tag color="green" icon={icons.delivered}>Delivered</Tag>
        );

      case "Received from the Lab":
        return (
          <Tag color="blue" icon={icons.received}>Received from the Lab</Tag>
        );

      case "Delivered to the Lab":
        return (
          <Tag color="cyan" icon={icons.send}>Delivered to the Lab</Tag>
        );

      case "Confirmations Completed":
        return (
          <Tag color="geekblue" icon={icons.delivered}>Confirmations Completed</Tag>
        );

      case "Pending Customer Confirmation":
        return (
          <Tag color="orange" icon={icons.clock}>Pending Customer Confirmation </Tag>
        );

      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title : "Batch Number",
      dataIndex : "batch",
      render : (text) => (
        <a style={{fontWeight: 500}}>{text}</a>
      ),
    },
    {
      title : "Orders",
      dataIndex : "orders",
      align : "center",
      render: (orders) => (
        <Badge count={orders} style={{backgroundColor: "#1677ff"}} />
      ),
    },
    {
      title: "Current Status",
      dataIndex: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Update Status",
      dataIndex: "update",
      render: (value) => (
        <Select defaultValue={value} style={{width: 220}}>
          <Option value="Delivered">Delivered</Option>
          <Option value="Received from the Lab">Received from the Lab</Option>
          <Option value="Delivered to the Lab">Delivered to the Lab</Option>
          <Option value="Confirmations Completed">Confirmations Completed</Option>
          <Option value="Pending Customer Confirmation">Pending Customer Confirmation</Option>
          <Option value="Out for Delivery">Out for Delivery</Option>
        </Select>
      )
    },
    {
      title: "Next Status",
      dataIndex: "next",
      render: (next) => 
        next === "Final Status" ? (
          <Tag color="green">Final Status</Tag>
        ) : (
          <Button type='primary' icon={icons.arrow} backgroundColor="white">Next</Button>
        ),
    },{
      title: "Action",
      render: () => (
        <Button  icon={icons.history} />
      ),
    },
  ];
    
  return (
    <Card title={
      <Space>
        <span icon="cleaningSolutions"> Batch mangement</span>
        <Badge count = {5} style={{backgroundColor:"#1677ff"}}/>
      </Space>
    } 
      style={{borderRadius: 12,}} >
        <Table columns={columns} dataSource={data} pagination={{pageSize: 5}}/>

    </Card>
  );
}
