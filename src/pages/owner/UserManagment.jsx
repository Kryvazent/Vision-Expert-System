import { Card, Table, Button, Modal, Input, Select } from "antd";
import { useState } from "react";

export default function UserManagement() {

  // 🔹 Modal state
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Dummy data
  const data = [
    {
      key: "1",
      name: "John Doe",
      role: "OWNER",
      email: "john@visionexpert.com",
      branch: "Kadawatha",
      status: "Active",
    },
    {
      key: "2",
      name: "Sarah Lee",
      role: "MANAGER",
      email: "sarah@visionexpert.com",
      branch: "Kadawatha",
      status: "Active",
    },
  ];

  // 🔹 Table columns
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Role", dataIndex: "role" },
    { title: "Email", dataIndex: "email" },
    { title: "Branch", dataIndex: "branch" },

    {
      title: "Status",
      dataIndex: "status",
      render: (val) => (
        <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
          {val}
        </span>
      ),
    },

    {
      title: "Actions",
      render: () => (
        <div className="flex flex-col gap-1">

          {/* Edit */}
          <button className="text-blue-500 text-sm hover:bg-blue-50 px-2 py-1 rounded transition">
            Edit
          </button>

          {/* Deactivate */}
          <button className="text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded transition">
            Deactivate
          </button>

        </div>
      ),
    },
  ];

  return (
    <div className="p-6">

      {/* 🔹 Main Card */}
      <Card
        title="User Management"
        extra={
          <Button type="primary" onClick={() => setIsOpen(true)}>
            Add Staff
          </Button>
        }
      >

        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
        />

      </Card>

      {/* 🔹 Modal */}
      <Modal
        title="Add New Staff"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
      >

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="font-medium">Name</label>
            <Input placeholder="Enter name" />
          </div>

          {/* Email */}
          <div>
            <label className="font-medium">Email</label>
            <Input placeholder="Enter email" />
          </div>

          {/* Role */}
          <div>
            <label className="font-medium">Role</label>
            <Select
              className="w-full"
              placeholder="Select role"
              options={[
                { value: "manager", label: "Manager" },
                { value: "optometrist", label: "Optometrist" },
                { value: "sales", label: "Sales Executive" },
                { value: "recovery", label: "Recovery Officer" },
                { value: "assistant", label: "Assistant" },
              ]}
            />
          </div>

          {/* Branch */}
          <div>
            <label className="font-medium">Branch</label>
            <Select
              className="w-full"
              placeholder="Select branch"
              options={[
                { value: "kadawatha", label: "Kadawatha" },
                { value: "kandy", label: "Kandy" },
              ]}
            />
          </div>

          {/* Button */}
          <Button type="primary" block>
            Add User
          </Button>

        </div>

      </Modal>

    </div>
  );
}