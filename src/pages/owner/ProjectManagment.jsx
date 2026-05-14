import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Table,
  Tag,
  DatePicker,
} from "antd";

import { useState } from "react";

import {
  FileTextOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const LOAD_PROJECTS = gql`
  query {

    projectCollection {

      edges {

        node {

          id

          project_name

          description

          start_date

          end_date

          start_time

          is_active

          branch {

            id
            branch_name

          }

          clinicCollection {

            edges {

              node {
                id
              }

            }

          }

        }

      }

    }

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

const INSERT_PROJECT = gql`
  mutation InsertProject(
    $projectName: String!
    $description: String!
    $branchId: Int!
    $startDate: Date!
    $endDate: Date!
    $startTime: Time!
  ) {

    insertIntoprojectCollection(
      objects: {

        project_name: $projectName

        description: $description

        branch_id: $branchId

        start_date: $startDate

        end_date: $endDate

        start_time: $startTime

        is_active: true

      }

    ) {

      affectedCount

    }

  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: Int!
    $projectName: String!
    $description: String!
    $branchId: Int!
    $startDate: Date!
    $endDate: Date!
    $startTime: Time!
  ) {

    updateprojectCollection(

      filter: {
        id: {
          eq: $id
        }
      }

      set: {

        project_name: $projectName

        description: $description

        branch_id: $branchId

        start_date: $startDate

        end_date: $endDate

        start_time: $startTime

      }

    ) {

      affectedCount

    }

  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: Int!) {

    deleteFromprojectCollection(

      filter: {
        id: {
          eq: $id
        }
      }

    ) {

      affectedCount

    }

  }
`;

export default function ProjectManagement() {

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingProjectId, setEditingProjectId] =
    useState(null);

  const [selectedBranch, setSelectedBranch] =
    useState("All");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [formData, setFormData] = useState({

    projectName: "",

    description: "",

    branchId: "",

    startDate: "",

    endDate: "",

    startTime: "",

  });

  const {
    data,
    loading,
    refetch,
  } = useQuery(LOAD_PROJECTS);

  const [insertProject] =
    useMutation(INSERT_PROJECT);

  const [updateProject] =
    useMutation(UPDATE_PROJECT);

  const [deleteProject] =
    useMutation(DELETE_PROJECT);

  const updateValue = (field, value) => {

    setFormData({

      ...formData,

      [field]: value,

    });

  };

  // project data
  const allProjects =
    data?.projectCollection?.edges?.map((edge) => ({

      key: edge.node.id,

      id: edge.node.id,

      project_name: edge.node.project_name,

      description: edge.node.description,

      start_date: edge.node.start_date,

      end_date: edge.node.end_date,

      start_time: edge.node.start_time,

      branch:
        edge.node.branch?.branch_name,

      branchId:
        edge.node.branch?.id,

      clinics_count:
        edge.node.clinicCollection?.edges
          ?.length || 0,

      status:
        edge.node.is_active
          ? "Active"
          : "Inactive",

    })) || [];

  // filter
  const filteredProjects =
    allProjects.filter((project) => {

      const branchMatch =

        selectedBranch === "All" ||

        project.branch === selectedBranch;

      const statusMatch =

        selectedStatus === "All" ||

        project.status === selectedStatus;

      return branchMatch && statusMatch;

    });

  // cards
  const totalProjects =
    allProjects.length;

  const activeProjects =
    allProjects.filter(

      (p) => p.status === "Active"

    ).length;

  // ADD / UPDATE
  const handleAddProject = async () => {

    try {

      // EDIT
      if (editingProjectId) {

        await updateProject({

          variables: {

            id: editingProjectId,

            projectName:
              formData.projectName,

            description:
              formData.description,

            branchId:
              parseInt(formData.branchId),

            startDate:
              formData.startDate,

            endDate:
              formData.endDate,

            startTime:
              formData.startTime,

          },

        });

      }

      // INSERT
      else {

        await insertProject({

          variables: {

            projectName:
              formData.projectName,

            description:
              formData.description,

            branchId:
              parseInt(formData.branchId),

            startDate:
              formData.startDate,

            endDate:
              formData.endDate,

            startTime:
              formData.startTime,

          },

        });

      }

      refetch();

      setIsModalOpen(false);

      setEditingProjectId(null);

      setFormData({

        projectName: "",

        description: "",

        branchId: "",

        startDate: "",

        endDate: "",

        startTime: "",

      });

    } catch (err) {

      console.log(err);

    }

  };

  // EDIT
  const handleEdit = (project) => {

    setEditingProjectId(project.id);

    setFormData({

      projectName:
        project.project_name,

      description:
        project.description,

      branchId:
        project.branchId,

      startDate:
        project.start_date,

      endDate:
        project.end_date,

      startTime:
        project.start_time,

    });

    setIsModalOpen(true);

  };

  // DELETE
  const handleDelete = async (id) => {

    try {

      await deleteProject({

        variables: {
          id,
        },

      });

      refetch();

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-6 pr-2">

      {/* ADD BUTTON */}
      <Button
        type="primary"
        onClick={() => {

          setEditingProjectId(null);

          setFormData({

            projectName: "",

            description: "",

            branchId: "",

            startDate: "",

            endDate: "",

            startTime: "",

          });

          setIsModalOpen(true);

        }}
      >

        + New Project

      </Button>

      {/* CARDS */}
      <div className="flex flex-wrap gap-6">

        <Card className="w-[230px]">

          <div className="flex items-center gap-4">

            <FileTextOutlined
              style={{
                fontSize: 40,
                color: "#2563eb",
              }}
            />

            <div>

              <p className="text-gray-500">
                Total Projects
              </p>

              <h2 className="text-2xl font-bold">
                {totalProjects}
              </h2>

            </div>

          </div>

        </Card>

        <Card className="w-[230px]">

          <div className="flex items-center gap-4">

            <CalendarOutlined
              style={{
                fontSize: 40,
                color: "#10b981",
              }}
            />

            <div>

              <p className="text-gray-500">
                Active Projects
              </p>

              <h2 className="text-2xl font-bold text-green-600">
                {activeProjects}
              </h2>

            </div>

          </div>

        </Card>

      </div>

      {/* FILTERS */}
      <Card>

        <div className="flex flex-wrap gap-4">

          {/* branch filter */}
          <Select
            className="w-[220px]"
            value={selectedBranch}
            onChange={setSelectedBranch}
            options={[

              {
                value: "All",
                label: "All Branches",
              },

              ...(data?.branchCollection?.edges?.map(
                (b) => ({
                  value: b.node.branch_name,
                  label: b.node.branch_name,
                })
              ) || []),

            ]}
          />

          {/* status filter */}
          <Select
            className="w-[220px]"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[

              {
                value: "All",
                label: "All Status",
              },

              {
                value: "Active",
                label: "Active",
              },

              {
                value: "Inactive",
                label: "Inactive",
              },

            ]}
          />

        </div>

      </Card>

      {/* TABLE */}
      <Card title="Projects">

        <Table
          loading={loading}

          dataSource={filteredProjects}

          pagination={false}

          columns={[

            {
              title: "Project ID",
              dataIndex: "id",
            },

            {
              title: "Project Name",
              dataIndex: "project_name",
            },

            {
              title: "Description",
              dataIndex: "description",
            },

            {
              title: "Branch",
              dataIndex: "branch",

              render: (branch) => (
                <Tag color="blue">
                  {branch}
                </Tag>
              ),
            },

            {
              title: "Start Date",
              dataIndex: "start_date",
            },

            {
              title: "End Date",
              dataIndex: "end_date",
            },

            {
              title: "Start Time",
              dataIndex: "start_time",
            },

            {
              title: "Clinics Count",
              dataIndex: "clinics_count",
            },

            {
              title: "Status",
              dataIndex: "status",

              render: (status) => (

                <Tag
                  color={
                    status === "Active"
                      ? "green"
                      : "red"
                  }
                >

                  {status}

                </Tag>
              ),
            },

            {
              title: "Actions",

              render: (_, record) => (

                <div className="flex gap-3">

                  {/* EDIT */}
                  <Button
                    type="primary"

                    icon={<EditOutlined />}

                    onClick={() =>
                      handleEdit(record)
                    }
                  >

                    Edit

                  </Button>

                  {/* DELETE */}
                  <Button
                    danger

                    icon={<DeleteOutlined />}

                    onClick={() =>
                      handleDelete(record.id)
                    }
                  >

                    Delete

                  </Button>

                </div>

              ),
            },

          ]}
        />

      </Card>

      {/* MODAL */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddProject}
        title={
          editingProjectId
            ? "Edit Project"
            : "Add New Project"
        }
      >

        <div className="space-y-4">

          {/* name */}
          <div>

            <p>Project Name</p>

            <Input
              value={formData.projectName}
              onChange={(e) =>
                updateValue(
                  "projectName",
                  e.target.value
                )
              }
            />

          </div>

          {/* description */}
          <div>

            <p>Description</p>

            <Input.TextArea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                updateValue(
                  "description",
                  e.target.value
                )
              }
            />

          </div>

          {/* branch */}
          <div>

            <p>Branch</p>

            <Select
              className="w-full"

              value={formData.branchId}

              onChange={(value) =>
                updateValue(
                  "branchId",
                  value
                )
              }

              options={
                data?.branchCollection?.edges?.map(
                  (b) => ({
                    value: b.node.id,
                    label: b.node.branch_name,
                  })
                ) || []
              }
            />

          </div>

          {/* start date */}
          <div>

            <p>Start Date</p>

            <DatePicker
              className="w-full"

              onChange={(
                date,
                dateString
              ) =>

                updateValue(
                  "startDate",
                  dateString
                )

              }
            />

          </div>

          {/* end date */}
          <div>

            <p>End Date</p>

            <DatePicker
              className="w-full"

              onChange={(
                date,
                dateString
              ) =>

                updateValue(
                  "endDate",
                  dateString
                )

              }
            />

          </div>

          {/* start time */}
          <div>

            <p>Start Time</p>

            <Input
              type="time"

              value={formData.startTime}

              onChange={(e) =>

                updateValue(
                  "startTime",
                  e.target.value
                )

              }
            />

          </div>

        </div>

      </Modal>

    </div>

  );
}