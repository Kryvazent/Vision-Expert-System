import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { Card, Col, Collapse, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "../../../const/functions";


const GET_PROJECT = gql`
        query GetProject($branchId: ID!, $today: Date!) {
            projectCollection(filter: { branch_id: { eq: $branchId }, is_active: { eq: true } }) {
                edges {
                    node {
                        id
                        project_name
                        clinicCollection(filter: { date: { eq: $today } }) {
                            edges {
                                node {
                                    id
                                    venue
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

function ProjectAndClinicSelect({ setSelectedClinic,selectedClinic, setSelectedProject,selectedProject, setIsDisabled }) {

    const { staff } = useAuth();
    const [collapseKey, setCollapseKey] = useState(['1']);
    const [loadProjectData, { data: projectData, loading: projectLoading }] = useLazyQuery(GET_PROJECT);






    const projectCount = projectData?.projectCollection?.edges?.length || 0;

    let clinicCount;
    if (projectCount > 1) {
        clinicCount = selectedProjectData?.node?.clinicCollection?.edges?.length || 0;
    } else {
        clinicCount = projectData?.projectCollection?.edges?.[0]?.node?.clinicCollection?.edges?.length || 0;
    }

    const needsProjectSelection = projectCount > 1 && !selectedProject;
    const needsClinicSelection = selectedProject && clinicCount > 1 && !selectedClinic;

    const isDisabled = selectedProject != null && selectedClinic != null;
    setIsDisabled(!isDisabled);


    const selectedProjectData = projectData?.projectCollection?.edges?.find(
        (edge) => edge.node.id === selectedProject
    );

    useEffect(() => {
        const pCount = projectData?.projectCollection?.edges?.length || 0;
        const cCount = projectData?.projectCollection?.edges?.[0]?.node?.clinicCollection?.edges?.length || 0;

        if (pCount === 1) {
            setSelectedProject(projectData?.projectCollection?.edges?.[0]?.node?.id);
        }

        if (pCount === 1 && cCount === 1) {
            setSelectedClinic(
                projectData?.projectCollection?.edges?.[0]?.node?.clinicCollection?.edges?.[0]?.node?.id
            );
        }

        setCollapseKey(pCount === 1 && cCount === 1 ? [] : ['1']);
    }, [projectData,setSelectedClinic,setSelectedProject]);


    useEffect(() => {
        if (staff?.branch.id) {
            const today = new Date().toISOString().split("T")[0];
            loadProjectData({
                variables: {
                    branchId: staff.branch.id,
                    today
                }
            });
        }
    }, [staff?.branch.id, loadProjectData]);

    return (
        <Collapse
            defaultActiveKey={collapseKey}
            items={[
                {
                    key: '1',
                    label: (
                        <div className="flex justify-between items-center w-full">
                            <span className="font-semibold">
                                Project & Clinic
                            </span>
                            <span className="text-sm text-gray-500">
                                {projectCount > 1 && !selectedProject && "⚠ Select Project"}
                                {projectCount === 1 && clinicCount === 1 && "✔ Project & Clinic Auto Selected"}
                                {selectedProject && clinicCount > 1 && !selectedClinic && " | ⚠ Select Clinic"}
                                {selectedProject && clinicCount === 0 && " | ❌ No Clinics Available"}
                            </span>
                        </div>
                    ),
                    children: (
                        <Card>
                            <Row className="gap-5">

                                {/* PROJECT SELECT */}
                                <Col span={8}>
                                    <p className="font-medium">
                                        Select Project {projectCount > 1 && <span className="text-red-500">*</span>}
                                    </p>
                                    <Select
                                        className="w-full"
                                        placeholder="Select Project"
                                        value={selectedProject}
                                        onChange={(value) => {
                                            setSelectedProject(value);
                                            setSelectedClinic(null);
                                        }}
                                        options={projectData?.projectCollection?.edges?.map(edge => ({
                                            label: edge.node.project_name,
                                            value: edge.node.id
                                        }))}
                                        loading={projectLoading}
                                        status={needsProjectSelection ? "error" : ""}
                                    />
                                </Col>

                                {/* CLINIC SELECT */}
                                <Col span={8}>
                                    <p className="font-medium">
                                        Select Today's Clinic {clinicCount > 1 && <span className="text-red-500">*</span>}
                                    </p>
                                    <Select
                                        className="w-full"
                                        placeholder={
                                            !selectedProject
                                                ? "Select project first"
                                                : clinicCount === 0
                                                    ? "No clinics available today"
                                                    : "Select Clinic"
                                        }
                                        value={selectedClinic}
                                        disabled={!selectedProject || clinicCount === 0}
                                        onChange={(value) => setSelectedClinic(value)}
                                        options={selectedProjectData?.node?.clinicCollection?.edges?.map(edge => ({
                                            label: edge.node.venue,
                                            value: edge.node.id
                                        }))}
                                        status={needsClinicSelection ? "error" : ""}
                                    />
                                </Col>

                            </Row>
                        </Card>
                    )
                }
            ]}
        />
    )
}

export default ProjectAndClinicSelect;