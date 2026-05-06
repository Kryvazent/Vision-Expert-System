import {
  Card,
  Table,
  Button,
  Select,
  Modal,
  Input,
  DatePicker,
} from "antd";
import { useEffect, useState } from "react";
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
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";

const { RangePicker } = DatePicker;

export default function ProjectManagement() {

  const [open, setOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    projectName: null,
    branchId: null,
    desription: null
  });

  const updateValue = (field, value) => {
    setNewProjectData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // 🔹 Table columns
  const columns = [
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
      width: 150,
      render: (val) => (
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
          {val}
        </span>
      ),
    },

    {
      title: "Clinics Count",
      dataIndex: "clinics",
      width: 120
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (val) => {
        let style = "bg-green-100 text-green-600";
        return (
          <span className={`${style} px-2 py-1 rounded text-sm`}>
            {val}
          </span>
        );
      },
    },
  ];

  // add new projects
  const LOAD_BRANCHES = gql`
  
    query GetBranches {
      branchCollection(filter: {is_active: {eq: true}}) {
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

  const branchesOptions = branchesData?.branchCollection?.edges?.map((edge) => {
    return { value: edge.node.id, label: edge.node.branch_name };
  }) || [];

  const ADD_NEW_PROJECT = gql`
  
    mutation CreateProject($projectName: String!, $venue: String!, $description: String, $branchId: ID!) {
      insertIntoprojectCollection(
        objects:{
          branch_id: $branchId,
          project_name: $projectName,
          description: $description
        }
      ){
        records{
          id
        }
      }
    }
  `;
  const [createProject] = useMutation(ADD_NEW_PROJECT);

  const handleCreateProject = async () => {

    if (!newProjectData.projectName || !newProjectData.branchId) {
      console.log("Missing fields:", newProjectData);
      alert("Please fill all required fields");

      return;
    }

    console.log("Missing fields:", newProjectData);

    await createProject({
      variables: {
        projectName: newProjectData.projectName,
        venue: newProjectData.venue,
        description: newProjectData.description,
        branchId: newProjectData.branchId
      }
    })
  }




  // // load projects
  const LOAD_PROJECTS = gql`
  
    query GetProjects {
      projectCollection {
        edges {
          node {
            id
            project_name
            branch {
              id
              branch_name
            }
            is_active
            clinicCollection{
              edges{
                node{
                  id
                }
              }
            }
          }
        }
      }
    }
  `;
  const [loadProjects, { data: projectsData }] = useLazyQuery(LOAD_PROJECTS);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // console.log("Projects:", projectsData);
  const projectCount = projectsData?.projectCollection?.edges?.length || 0;
  const allProjects = projectsData?.projectCollection?.edges?.map(edge => {

    if (edge.node.is_active) {
      return {
        id: edge.node.id,
        project_name: edge.node.project_name,
        description: edge.node.description,
        branch: edge.node.branch?.branch_name,
        clinics: edge.node.clinicCollection?.edges?.length || 0, 
        status: edge.node.is_active ? "Active" : "Inactive",
      };
    }
    return;
  }) || [];
  console.log("All Projects:", allProjects);


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

        <Card className="min-w-50">
          <div className="flex items-center gap-2">
            <div>
              <FileTextOutlined style={{ fontSize: 40, color: "#2563eb" }} />
            </div>
            <div>
              <p className="text-gray-500">Total Projects</p>
              <h2 className="text-xl font-bold">{projectCount}</h2>
            </div>

          </div>
        </Card>

        <Card className="min-w-50">
          <div className="flex items-center gap-2">
            <div>
              <CalendarOutlined style={{ fontSize: 40, color: "#10b981" }} />
            </div>
            <div>

              <p className="text-gray-500">Active Projects</p>
              <h2 className="text-xl font-bold text-green-600">{allProjects.filter(p => p.status === "Active").length}</h2>
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
          dataSource={allProjects}
          pagination={false}
          scroll={{ x: 1000 }} // ⭐ important
        />
      </Card>

      {/* 🔹 new project Modal */}
      <Modal
        title="New Project"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <div className="space-y-4 mt-5">

          <div>
            <label>Project Name</label>
            <Input placeholder="Enter project name" value={newProjectData.projectName} onChange={(e) => updateValue('projectName', e.target.value)} />
          </div>

          <div>
            <label>Description</label>
            <Input.TextArea rows={3} value={newProjectData.description} onChange={(e) => updateValue('description', e.target.value)} />
          </div>

          <div className="flex flex-col">
            <label>Branch</label>
            <Select
              className="w-full"
              placeholder="Branch"
              options={branchesOptions}
              onChange={(value) => updateValue('branchId', value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleCreateProject}>Create</Button>
          </div>

        </div>
      </Modal>

    </div>
  );
}