import { Button, Card, Col, Input, Modal, Row, Space, Table, Tag, message, Select, Statistic, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { headerStyles, buttonStyles, cardStyles, modalStyles, formStyles, statusColors } from "../../const/designSystem";

const { Title, Text } = Typography;

const { Option } = Select;

const LOAD_BRANCHES = gql`
    query getBranches {
        branchCollection(orderBy: [{ id: AscNullsLast }]) {
            edges {
                node {
                    id
                    branch_name
                    address
                    email
                    is_active
                    staffCollection {
                        edges {
                            node {
                                id
                                first_name
                                last_name
                                role {
                                    role
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const LOAD_ROLES = gql`
    query getRoles {
        roleCollection {
            edges {
                node {
                    id
                    role
                }
            }
        }
    }
`;

const LOAD_UNASSIGNED_STAFF = gql`
    query getUnassignedStaff {
        staffCollection(
            filter: { branch_id: { isNull: true } }
        ) {
            edges {
                node {
                    id
                    first_name
                    last_name
                    role {
                        id
                        role
                    }
                }
            }
        }
    }
`;

const CREATE_BRANCH = gql`
    mutation createBranch(
        $branchName: String!,
        $address: String!,
        $email: String!
    ) {
        insertIntobranchCollection(
            objects: {
                branch_name: $branchName
                address: $address
                email: $email
                is_active: true
            }
        ) {
            records {
                id
            }
        }
    }
`;

const UPDATE_BRANCH = gql`
    mutation updateBranch(
        $id: Int!,
        $branchName: String!,
        $address: String!,
        $email: String!,
        $isActive: Boolean!
    ) {
        updatebranchCollection(
            filter: { id: { eq: $id } }
            set: {
                branch_name: $branchName
                address: $address
                email: $email
                is_active: $isActive
            }
        ) {
            records {
                id
            }
        }
    }
`;

const ASSIGN_STAFF = gql`
    mutation assignStaff($staffId: Int!, $branchId: Int!) {
        updatestaffCollection(
            filter: { id: { eq: $staffId } }
            set: { branch_id: $branchId }
        ) {
            records {
                id
            }
        }
    }
`;

const REMOVE_STAFF = gql`
    mutation removeStaff($staffId: Int!) {
        updatestaffCollection(
            filter: { id: { eq: $staffId } }
            set: { branch_id: null }
        ) {
            records {
                id
            }
        }
    }
`;

export default function BranchManagement() {
    const [branches, setBranches] = useState([]);
    const [roles, setRoles] = useState([]);
    const [unassignedStaff, setUnassignedStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [branchModalVisible, setBranchModalVisible] = useState(false);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [branchName, setBranchName] = useState("");
    const [branchAddress, setBranchAddress] = useState("");
    const [branchEmail, setBranchEmail] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [loadBranches, { data: branchesData, refetch }] = useLazyQuery(LOAD_BRANCHES);
    const [loadRoles, { data: rolesData }] = useLazyQuery(LOAD_ROLES);
    const [loadUnassignedStaff, { data: unassignedStaffData, refetch: refetchUnassigned }] = useLazyQuery(LOAD_UNASSIGNED_STAFF);

    const [createBranch] = useMutation(CREATE_BRANCH);
    const [updateBranch] = useMutation(UPDATE_BRANCH);
    const [assignStaff] = useMutation(ASSIGN_STAFF);
    const [removeStaff] = useMutation(REMOVE_STAFF);

    useEffect(() => {
        loadBranches();
        loadRoles();
        loadUnassignedStaff();
    }, [loadBranches, loadRoles, loadUnassignedStaff]);

    useEffect(() => {
        if (branchesData) {
            const edges = branchesData?.branchCollection?.edges || [];
            setBranches(edges.map((e) => e.node));
        }
    }, [branchesData]);

    useEffect(() => {
        if (rolesData) {
            const edges = rolesData?.roleCollection?.edges || [];
            setRoles(edges.map((e) => e.node));
        }
    }, [rolesData]);

    useEffect(() => {
        if (unassignedStaffData) {
            const edges = unassignedStaffData?.staffCollection?.edges || [];
            setUnassignedStaff(edges.map((e) => e.node));
        }
    }, [unassignedStaffData]);

    const handleCreateBranch = async () => {
        if (!branchName || !branchAddress || !branchEmail) {
            message.error("Please fill in required fields");
            return;
        }

        try {
            await createBranch({
                variables: {
                    branchName: branchName,
                    address: branchAddress,
                    email: branchEmail,
                },
            });
            message.success("Branch created successfully");
            setBranchModalVisible(false);
            resetBranchForm();
            refetch();
        } catch (error) {
            console.error("Error creating branch:", error);
            message.error("Failed to create branch.");
        }
    };

    const handleUpdateBranch = async () => {
        if (!editingBranch || !branchName || !branchAddress || !branchEmail) {
            message.error("Please fill in required fields");
            return;
        }

        try {
            await updateBranch({
                variables: {
                    id: editingBranch.id,
                    branchName: branchName,
                    address: branchAddress,
                    email: branchEmail,
                    isActive: isActive,
                },
            });
            message.success("Branch updated successfully");
            setBranchModalVisible(false);
            resetBranchForm();
            setEditingBranch(null);
            refetch();
        } catch (error) {
            console.error("Error updating branch:", error);
            message.error("Failed to update branch.");
        }
    };

    const handleEditBranch = (branch) => {
        setEditingBranch(branch);
        setBranchName(branch.branch_name);
        setBranchAddress(branch.address || "");
        setBranchEmail(branch.email || "");
        setIsActive(branch.is_active);
        setBranchModalVisible(true);
    };

    const resetBranchForm = () => {
        setBranchName("");
        setBranchAddress("");
        setBranchEmail("");
        setIsActive(true);
    };

    const handleAssignClick = (branch) => {
        setSelectedBranch(branch);
        setSelectedStaff(null);
        setAssignModalVisible(true);
    };

    const handleAssign = async () => {
        if (!selectedStaff || !selectedBranch) {
            message.error("Please select a staff member");
            return;
        }

        try {
            await assignStaff({
                variables: {
                    staffId: selectedStaff,
                    branchId: selectedBranch.id,
                },
            });
            message.success("Staff assigned successfully");
            setAssignModalVisible(false);
            setSelectedBranch(null);
            setSelectedStaff(null);
            refetch();
            refetchUnassigned();
        } catch (error) {
            console.error("Error assigning staff:", error);
            message.error("Failed to assign staff.");
        }
    };

    const handleRemoveStaff = async (staffId) => {
        try {
            await removeStaff({
                variables: { staffId },
            });
            message.success("Staff removed from branch successfully");
            refetch();
            refetchUnassigned();
        } catch (error) {
            console.error("Error removing staff:", error);
            message.error("Failed to remove staff.");
        }
    };

    const stats = {
        total: branches.length,
        active: branches.filter((b) => b.is_active).length,
        inactive: branches.filter((b) => !b.is_active).length,
        totalStaff: branches.reduce((sum, b) => sum + (b.staffCollection?.edges?.length || 0), 0),
    };

    const branchColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Branch Name",
            dataIndex: "branch_name",
            key: "branch_name",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ellipsis: true,
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            render: (v) => (
                <Tag color={v ? "green" : "red"}>{v ? "Active" : "Inactive"}</Tag>
            ),
        },
        {
            title: "Staff Count",
            key: "staffCount",
            render: (_, record) => record.staffCollection?.edges?.length || 0,
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<UserOutlined />}
                        onClick={() => handleAssignClick(record)}
                    >
                        Assign Staff
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditBranch(record)}
                    >
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    const staffColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Name",
            key: "name",
            render: (_, record) => `${record.first_name} ${record.last_name}`.trim(),
        },
        {
            title: "Role",
            key: "role",
            render: (_, record) => record.role?.role || "-",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button
                    danger
                    size="small"
                    onClick={() => handleRemoveStaff(record.id)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={headerStyles.container}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={2} style={headerStyles.title}>
                            Branch Management
                        </Title>
                        <Text type="secondary" style={headerStyles.subtitle}>
                            Manage all branches and staff assignments
                        </Text>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                resetBranchForm();
                                setEditingBranch(null);
                                setBranchModalVisible(true);
                            }}
                            style={buttonStyles.primary}
                        >
                            Add Branch
                        </Button>
                    </Col>
                </Row>
            </div>

            <Card style={cardStyles.default}>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Statistic
                            title="Total Branches"
                            value={stats.total}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Active"
                            value={stats.active}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Inactive"
                            value={stats.inactive}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Total Staff"
                            value={stats.totalStaff}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title="Branches" style={{ marginTop: 16 }}>
                <Table
                    columns={branchColumns}
                    dataSource={branches}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ padding: "16px" }}>
                                <h4>Staff Members</h4>
                                <Table
                                    columns={staffColumns}
                                    dataSource={record.staffCollection?.edges?.map((e) => e.node) || []}
                                    pagination={false}
                                    rowKey="id"
                                    size="small"
                                />
                            </div>
                        ),
                    }}
                />
            </Card>

            <Modal
                title={editingBranch ? "Edit Branch" : "Add Branch"}
                open={branchModalVisible}
                onOk={editingBranch ? handleUpdateBranch : handleCreateBranch}
                onCancel={() => {
                    setBranchModalVisible(false);
                    resetBranchForm();
                    setEditingBranch(null);
                }}
                okText={editingBranch ? "Update" : "Create"}
                cancelText="Cancel"
                {...modalStyles.default}
            >
                <div style={{ marginBottom: 16 }}>
                    <label style={formStyles.label}>Branch Name *</label>
                    <Input
                        placeholder="Enter branch name"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        style={formStyles.input}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={formStyles.label}>Address *</label>
                    <Input
                        placeholder="Enter address"
                        value={branchAddress}
                        onChange={(e) => setBranchAddress(e.target.value)}
                        style={formStyles.input}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={formStyles.label}>Email *</label>
                    <Input
                        placeholder="Enter email"
                        value={branchEmail}
                        onChange={(e) => setBranchEmail(e.target.value)}
                        style={formStyles.input}
                    />
                </div>

                {editingBranch && (
                    <div style={{ marginBottom: 16 }}>
                        <label style={formStyles.label}>Status</label>
                        <Select
                            style={formStyles.select}
                            value={isActive}
                            onChange={setIsActive}
                        >
                            <Option value={true}>Active</Option>
                            <Option value={false}>Inactive</Option>
                        </Select>
                    </div>
                )}
            </Modal>

            <Modal
                title="Assign Staff to Branch"
                open={assignModalVisible}
                onOk={handleAssign}
                onCancel={() => {
                    setAssignModalVisible(false);
                    setSelectedBranch(null);
                    setSelectedStaff(null);
                }}
                okText="Assign"
                cancelText="Cancel"
                {...modalStyles.default}
            >
                {selectedBranch && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <p><strong>Branch:</strong> {selectedBranch.branch_name}</p>
                            <p><strong>Address:</strong> {selectedBranch.address}</p>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <label style={formStyles.label}>Select Staff</label>
                            <Select
                                style={formStyles.select}
                                placeholder="Select unassigned staff"
                                value={selectedStaff}
                                onChange={setSelectedStaff}
                            >
                                {unassignedStaff.map((staff) => (
                                    <Option key={staff.id} value={staff.id}>
                                        {staff.first_name} {staff.last_name} ({staff.role?.role})
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
