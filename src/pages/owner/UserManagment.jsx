import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { Card, Table, Button, Modal, Input, Select } from "antd";
import { useEffect, useState } from "react";
import supabase from '../../client/supabase';

export default function UserManagement() {

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [newStaffData, setNewStaffData] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    roleId: null,
    branchId: null,
    email: "",
  });
  const [editStaffData, setEditStaffData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    nic: "",
    roleId: null,
    branchId: null,
  });

  const handleInputChange = (field, value) => {
    setNewStaffData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field, value) => {
    setEditStaffData((prev) => ({ ...prev, [field]: value }));
  };

  // Open edit modal and pre-fill with selected staff data
  const handleEditClick = (record) => {
    // Find the original node from staffData to get IDs
    const staffNode = staffData?.staffCollection?.edges.find(
      ({ node }) => node.id === record.key
    )?.node;

    setEditStaffData({
      id: staffNode?.id,
      firstName: staffNode?.first_name || "",
      lastName: staffNode?.last_name || "",
      nic: staffNode?.nic || "",
      roleId: staffNode?.role?.id || null,
      branchId: staffNode?.branch?.id || null,
    });
    setIsEditOpen(true);
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Role", dataIndex: "role" },
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
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <button
            className="text-blue-500 text-sm hover:bg-blue-50 px-2 py-1 rounded transition"
            onClick={() => handleEditClick(record)}
          >
            Edit
          </button>
          <button className="text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded transition">
            Deactivate
          </button>
        </div>
      ),
    },
  ];

  const LOAD_BRANCHES = gql`
    query loadbranches {
      branchCollection {
        edges {
          node {
            id
            branch_name
          }
        }
      }
    }
  `;
  const [loadBranches, { data: branchesData }] = useLazyQuery(LOAD_BRANCHES);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const LOAD_STAFF = gql`
    query loadstaff {
      staffCollection {
        edges {
          node {
            id
            first_name
            last_name
            nic
            role {
              id
              role_name
            }
            branch {
              id
              branch_name
            }
            is_active
          }
        }
      }
    }
  `;
  const [loadStaff, { data: staffData }] = useLazyQuery(LOAD_STAFF);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const staffList = staffData?.staffCollection?.edges
    .filter(({ node }) =>
      selectedBranch === "all" ? true : node.branch?.id === selectedBranch
    )
    .map(({ node }) => ({
      key: node.id,
      name: `${node.first_name} ${node.last_name}`,
      role: node.role?.role_name || "N/A",
      branch: node.branch?.branch_name || "N/A",
      status: node.is_active ? "Active" : "Inactive",
    }));

  const LOAD_ROLES = gql`
    query loadRoles {
      roleCollection {
        edges {
          node {
            id
            role_name
          }
        }
      }
    }
  `;
  const [loadRoles, { data: rolesData }] = useLazyQuery(LOAD_ROLES);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const ADD_STAFF = gql`
    mutation addStaff($firstName: String!, $lastName: String!, $nic: String!, $roleId: ID!, $branchId: ID!, $authUserId: ID!) {
      insertIntostaffCollection(
        objects: {
          first_name: $firstName,
          last_name: $lastName,
          nic: $nic,
          role_id: $roleId,
          branch_id: $branchId,
          auth_user_id: $authUserId
        }
      ) {
        records {
          id
        }
      }
    }
  `;
  const [addStaff] = useMutation(ADD_STAFF);

  // Update staff mutation
  const UPDATE_STAFF = gql`
    mutation updateStaff($id: ID!, $firstName: String!, $lastName: String!, $nic: String!, $roleId: ID!, $branchId: ID!) {
      updatestaffCollection(
        filter: { id: { eq: $id } }
        set: {
          first_name: $firstName,
          last_name: $lastName,
          nic: $nic,
          role_id: $roleId,
          branch_id: $branchId
        }
      ) {
        records {
          id
        }
      }
    }
  `;
  const [updateStaff] = useMutation(UPDATE_STAFF);

  const CHECK_DUPLICATE = gql`
    query checkDuplicate($nic: String!, $email: String!) {
      nicCheck: staffCollection(filter: { nic: { eq: $nic } }) {
        edges { node { id } }
      }
    }
  `;
  const [checkDuplicate] = useLazyQuery(CHECK_DUPLICATE);

  const handleAddStaff = async () => {
    if (
      newStaffData.roleId === null || newStaffData.branchId === null ||
      newStaffData.firstName.trim() === "" || newStaffData.lastName.trim() === "" ||
      newStaffData.nic.trim() === "" || newStaffData.email.trim() === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const { data: dupData } = await checkDuplicate({
        variables: { nic: newStaffData.nic },
      });

      const nicExists = dupData?.nicCheck?.edges?.length > 0;

      if (nicExists) {
        alert("A staff member with this NIC already exists.");
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newStaffData.email,
        password: Math.random().toString(36).slice(-8),
      });

      if (authError) {
        alert("Failed to create auth user: " + authError.message);
        return;
      }

      const authUserId = authData.user?.id;
      if (!authUserId) {
        alert("Auth user creation failed — no user ID returned.");
        return;
      }

      await addStaff({
        variables: {
          firstName: newStaffData.firstName,
          lastName: newStaffData.lastName,
          nic: newStaffData.nic,
          roleId: newStaffData.roleId,
          branchId: newStaffData.branchId,
          authUserId,
        },
      });

      alert("Staff added successfully");
      setIsOpen(false);
      setNewStaffData({ firstName: "", lastName: "", nic: "", roleId: null, branchId: null, email: "" });
      loadStaff();

    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleUpdateStaff = async () => {
    // Validate fields
    if (
      !editStaffData.id ||
      editStaffData.firstName.trim() === "" ||
      editStaffData.lastName.trim() === "" ||
      editStaffData.nic.trim() === "" ||
      editStaffData.roleId === null ||
      editStaffData.branchId === null
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await updateStaff({
        variables: {
          id: editStaffData.id,
          firstName: editStaffData.firstName,
          lastName: editStaffData.lastName,
          nic: editStaffData.nic,
          roleId: editStaffData.roleId,
          branchId: editStaffData.branchId,
        },
      });

      alert("Staff updated successfully");
      setIsEditOpen(false);
      setEditStaffData({ id: null, firstName: "", lastName: "", nic: "", roleId: null, branchId: null });
      loadStaff(); // Refresh table

    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update staff. Please try again.");
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      <Card
        title="User Management"
        extra={
          <Button type="primary" onClick={() => setIsOpen(true)}>
            Add Staff
          </Button>
        }
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-500">Branch</span>
          <Select
            value={selectedBranch}
            onChange={(val) => setSelectedBranch(val)}
            style={{ minWidth: 160 }}
            options={[
              { value: "all", label: "All Branches" },
              ...(branchesData?.branchCollection?.edges.map(({ node }) => ({
                value: node.id,
                label: node.branch_name,
              })) || []),
            ]}
          />
        </div>

        <Table columns={columns} dataSource={staffList} pagination={false} />
      </Card>

      {/* Add Staff Modal */}
      <Modal
        title="Add New Staff"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
      >
        <div className="space-y-4 mt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="font-medium">First Name</label>
              <Input
                placeholder="Enter first name"
                value={newStaffData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="font-medium">Last Name</label>
              <Input
                placeholder="Enter last name"
                value={newStaffData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="font-medium">NIC</label>
            <Input
              placeholder="Enter NIC number"
              value={newStaffData.nic}
              onChange={(e) => handleInputChange("nic", e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Email</label>
            <Input
              placeholder="Enter email"
              type="email"
              value={newStaffData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Role</label>
            <Select
              className="w-full"
              placeholder="Select role"
              value={newStaffData.roleId}
              onChange={(value) => handleInputChange("roleId", value)}
              options={rolesData?.roleCollection?.edges.map(({ node }) => ({
                value: node.id,
                label: node.role_name,
              })) || []}
            />
          </div>
          <div>
            <label className="font-medium">Branch</label>
            <Select
              className="w-full"
              placeholder="Select branch"
              value={newStaffData.branchId}
              onChange={(value) => handleInputChange("branchId", value)}
              options={branchesData?.branchCollection?.edges.map(({ node }) => ({
                value: node.id,
                label: node.branch_name,
              })) || []}
            />
          </div>
          <Button type="primary" block onClick={handleAddStaff}>
            Add Staff
          </Button>
        </div>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        title="Edit Staff Details"
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        footer={null}
      >
        <div className="space-y-4 mt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="font-medium">First Name</label>
              <Input
                placeholder="Enter first name"
                value={editStaffData.firstName}
                onChange={(e) => handleEditInputChange("firstName", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="font-medium">Last Name</label>
              <Input
                placeholder="Enter last name"
                value={editStaffData.lastName}
                onChange={(e) => handleEditInputChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="font-medium">NIC</label>
            <Input
              placeholder="Enter NIC number"
              value={editStaffData.nic}
              onChange={(e) => handleEditInputChange("nic", e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Role</label>
            <Select
              className="w-full"
              placeholder="Select role"
              value={editStaffData.roleId}
              onChange={(value) => handleEditInputChange("roleId", value)}
              options={rolesData?.roleCollection?.edges.map(({ node }) => ({
                value: node.id,
                label: node.role_name,
              })) || []}
            />
          </div>
          <div>
            <label className="font-medium">Branch</label>
            <Select
              className="w-full"
              placeholder="Select branch"
              value={editStaffData.branchId}
              onChange={(value) => handleEditInputChange("branchId", value)}
              options={branchesData?.branchCollection?.edges.map(({ node }) => ({
                value: node.id,
                label: node.branch_name,
              })) || []}
            />
          </div>
          <Button type="primary" block onClick={handleUpdateStaff}>
            Update Staff
          </Button>
        </div>
      </Modal>

    </div>
  );
}