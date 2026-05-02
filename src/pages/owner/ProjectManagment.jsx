import {
  Card,
  Table,
  Button,
  Select,
  Modal,
  Input,
  DatePicker,
} from "antd";
import { useState } from "react";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

export default function ProjectManagement() {
  const [open, setOpen] = useState(false);

  // 🔹 Dummy data
 const data = [
  {
    key: "1",
    id: "PRJ001",
    name: "Corporate Eye Care Campaign",
    year: "2026",
    location: "Dialog Axiata Head Office, Colombo",
    duration: "Mar 01 - Mar 15",
    branch: "Kadawatha",
    status: "Active",
    clinics: 5,
    customers: 120,
  },
  {
    key: "2",
    id: "PRJ002",
    name: "School Vision Screening Program",
    year: "2026",
    location: "Royal College, Colombo 07",
    duration: "Apr 05 - Apr 12",
    branch: "Kadawatha",
    status: "Planning",
    clinics: 3,
    customers: 80,  
  },
];

  // 🔹 Table columns
  const columns = [
    { title: "Project ID", dataIndex: "id", width: 120 },

    {
  title: "Project Name",
  dataIndex: "name",
  width: 280,
  render: (_, record) => (
    <div className="flex flex-col">

      {/* Project title */}
      <span className="font-semibold">
        {record.name}
      </span>

      {/* Year */}
      <span className="text-sm text-gray-500">
        {record.year}
      </span>

      {/* Location */}
      <span className="text-xs text-gray-400 flex items-center gap-1">
        📍 {record.location}
      </span>

    </div>
  ),
},

    { title: "Duration", dataIndex: "duration", width: 180 },

    {
      title: "Branch",
      dataIndex: "branch",
      width: 150,
      render: (val) => (
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
          {val}
        </span>
      ),
    },

    { title: "Clinics", dataIndex: "clinics", width: 120 },

    {
      title: "Customers",
      dataIndex: "customers",
      width: 120,
      render: (val) => (
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
          {val}
        </span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (val) => {
        let style = "bg-green-100 text-green-600";

        if (val === "Planning") style = "bg-blue-100 text-blue-600";
        if (val === "Completed") style = "bg-gray-200 text-gray-700";
        if(val === "Active") style = "bg-green-100 text-green-600";

        return (
          <span className={`${style} px-2 py-1 rounded text-sm`}>
            {val}
          </span>
        );
      },
    },

    {
      title: "Actions",
      fixed: "right" ,
      width: 120,
      render: () => (
        <div className="flex gap-3">

          <EyeOutlined className="cursor-pointer hover:text-blue-500 transition" />

          <EditOutlined className="cursor-pointer hover:text-green-500 transition" />

          <DeleteOutlined className="cursor-pointer hover:text-red-500 transition" />

        </div>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      
      <div className="flex justify-between items-center">
        {/* <div>
          <h1 className="text-2xl font-semibold">Project Management</h1>
          <p className="text-gray-500 text-sm">
            Manage company projects and clinic schedules
          </p>
        </div> */}

        <Button type="primary" onClick={() => setOpen(true)} className="top-3">
          + New Project
        </Button>
      </div>

      {/* 🔹 Stat Cards */}
      <div className="flex flex-wrap gap-4">

        <Card className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
            <div>
                <FileTextOutlined style={{ fontSize: 40, color: "#2563eb" }} />
            </div>
        <div>
          <p className="text-gray-500">Total Projects</p>
          <h2 className="text-xl font-bold">4</h2>
          </div>
          
        </div>
        </Card>

        <Card className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
            <div>
                <CalendarOutlined style={{ fontSize: 40, color: "#10b981" }} />
            </div>
        <div>
         
          <p className="text-gray-500">Active Projects</p>
          <h2 className="text-xl font-bold text-green-600">2</h2>
        </div>
        </div>
        </Card>

        <Card className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
            <div>
                <TeamOutlined style={{ fontSize: 40, color: "#f59e0b" }} />
            </div>
        <div>
          
          <p className="text-gray-500">Total Clinics</p>
          <h2 className="text-xl font-bold">12</h2>
        </div>
        </div>
        </Card>

        <Card className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
            <div>
                <UserOutlined style={{ fontSize: 40, color: "#ef4444" }} />
            </div>
        <div>
         
          <p className="text-gray-500">Total Customers</p>
          <h2 className="text-xl font-bold">313</h2>
          </div>
          </div>
        </Card>

      </div>

      {/* 🔹 Filters */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <Select
            placeholder="All Branches"
            className="w-48"
            options={[
              { value: "all", label: "All Branches" },
              { value: "kadawatha", label: "Kadawatha" },
              { value: "kandy", label: "Kandy" },
            ]}
          />

          <Select
            placeholder="All Status"
            className="w-48"
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "planning", label: "Planning" },
              { value: "completed", label: "Completed" },
            ]}
          />
        </div>
      </Card>

      {/* 🔹 Table */}
      <Card title="Projects">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 1000 }} // ⭐ important
        />
      </Card>

      {/* 🔹 Modal */}
      <Modal
        title="New Project"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <div className="space-y-4">

          <div>
            <label>Project Name</label>
            <Input placeholder="Enter project name" />
          </div>

          <div>
            <label>Venue</label>
            <Input placeholder="Enter venue" />
          </div>

          <div>
            <label>Description</label>
            <Input.TextArea rows={3} />
          </div>

          <div>
            <label>Project Duration</label>
            <RangePicker className="w-full" />
          </div>

          <div className="flex gap-4">
            <Select
              className="w-full"
              placeholder="Branch"
              options={[
                { value: "kadawatha", label: "Kadawatha" },
                { value: "kandy", label: "Kandy" },
              ]}
            />

            <Select
              className="w-full"
              placeholder="Status"
              options={[
                { value: "planning", label: "Planning" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary">Create</Button>
          </div>

        </div>
      </Modal>

    </div>
  );
}