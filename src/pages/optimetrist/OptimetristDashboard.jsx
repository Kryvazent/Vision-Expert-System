import { Badge, Button, Calendar, Card, Col, Row, Tag } from "antd";
import TopBar from "../../component/optimetrist/dashboard/TopBar";
import { Content } from "antd/es/layout/layout";
import PrescriptionDetailsModel from "../../component/optimetrist/dashboard/PrescriptionDetailsModel";
import { useEffect, useState } from "react";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";

import { EyeOutlined } from "@ant-design/icons";
import DateClinicSessionModal from "../../component/optimetrist/dashboard/DateClinicSessionModal";
import MonthClinicSessionModal from "../../component/optimetrist/dashboard/MonthClinicSessionModal";
import { gql } from "@apollo/client";
import { useLazyQuery, useQuery } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

import dayjs from "dayjs";

function OptimetristDashboard() {

    const { staff } = useAuth();
    const branchId = staff?.branch.id;

    const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false);
    const [modelType, setModelType] = useState("date");
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState("");

    const [calendarClinics, setCalendarClinics] = useState({});
    const [currentPanelDate, setCurrentPanelDate] = useState(dayjs());

    // load projects and clinics based on the selected date
    const GET_PROJECTS_AND_CLINICS_BY_DATE = gql`
    
        query GetProjectsAndClinicsByDate($date: Date!, $branchId: ID!) {
            projectCollection(filter: { branch_id: { eq: $branchId } }) {
                edges {
                    node {
                        id
                        project_name
                        description
                        clinicCollection(
                            filter: { 
                                date: { eq: $date } 
                            }
                        ) {
                        edges {
                            node {
                                id
                                venue
                                from
                                to
                                date
                                responsible_person_01
                                responsible_person_02
                                responsible_person_01_contact_no
                                responsible_person_02_contact_no
                                clinic_status {
                                    id
                                    status
                                }
                            }
                        }
                        }
                    }
                }
            }
        }

    `;
    const [getClinicsAndSessionsByDate, { loading, error, data }] = useLazyQuery(GET_PROJECTS_AND_CLINICS_BY_DATE);

    const daySelected = (date) => {

        setModelType("date");

        const formattedDate = date.format("YYYY-MM-DD");

        setStartDate(formattedDate);

        getClinicsAndSessionsByDate({
            variables: {
                date: formattedDate,
                branchId
            }
        });

        setShowModal(true);
    }

    // console.log("projects and clinic data:", data);

    const projectCount = data?.projectCollection?.edges.length || 0;
    // console.log("Project Count:", projectCount);

    const clinicCount =
        data?.projectCollection?.edges?.reduce((total, project) => {
            return total + (project.node.clinicCollection?.edges?.length || 0);
        }, 0) || 0;

    // console.log("Clinic Count:", clinicCount);

    const dateClinicModalData = {
        date: startDate,
        projectCount,
        clinicCount,
        description: data?.projectCollection?.edges[0]?.node.description || '',
        projectAndClinicList:
            data?.projectCollection?.edges.map((project) => ({
                projectName: project.node.project_name,
                clinics:
                    project.node.clinicCollection?.edges.map((clinic) => ({
                        id: clinic.node.id,
                        venue: clinic.node.venue,
                        from: clinic.node.from,
                        to: clinic.node.to,
                        responsiblePerson1: clinic.node.responsible_person_01,
                        responsiblePerson2: clinic.node.responsible_person_02,
                        responsiblePerson1Contact: clinic.node.responsible_person_01_contact_no,
                        responsiblePerson2Contact: clinic.node.responsible_person_02_contact_no,
                        status: clinic.node.clinic_status?.status,
                    })) || [],
            })) || [],
    };

    // console.log("Transformed Modal Data:", dateClinicModalData);



    const topBar = [
        {
            title: "Today Clinics",
            value: 0,
            iconSVG: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="#378ADD" />
                <path d="M3 19c0-3.31 4.03-6 9-6s9 2.69 9 6" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" />
                <path d="M19 7v4M21 9h-4" stroke="#378ADD" strokeWidth="1.8" strokeLinecap="round" />
            </svg>),
            bg: "#E6F1FB"
        }
    ]

    const getListData = value => {

        let listData = [];

        switch (value.date()) {
            case 8:
                listData = [
                    {
                        type: 'warning',
                        clinicName: 'Morning Eye Clinic',
                        place: 'Room 101, Main Building',
                        sessions: [
                            { id: 1, patient: 'John Smith', from: '08:00', to: '08:30' },
                            { id: 2, patient: 'Mary Johnson', from: '08:30', to: '09:00' },
                        ]
                    },
                    {
                        type: 'success',
                        clinicName: 'Afternoon Clinic',
                        place: 'Room 203, Annex Block',
                        sessions: [
                            { id: 3, patient: 'David Lee', from: '14:00', to: '14:45' },
                        ]
                    },
                ];
                break;
            case 10:
                listData = [
                    {
                        type: 'warning',
                        clinicName: 'General Eye Clinic',
                        place: 'Room 105, Main Building',
                        sessions: [
                            { id: 4, patient: 'Sara White', from: '09:00', to: '09:30' },
                            { id: 5, patient: 'Tom Brown', from: '09:30', to: '10:00' },
                            { id: 6, patient: 'Alice Green', from: '10:00', to: '10:30' },
                        ]
                    },
                ];
                break;
            case 15:
                listData = [
                    {
                        type: 'warning',
                        clinicName: 'Specialist Clinic',
                        place: 'Suite 3, West Wing',
                        sessions: [
                            { id: 7, patient: 'Bob Martin', from: '10:00', to: '11:00' },
                            { id: 8, patient: 'Linda Clark', from: '11:00', to: '12:00' },
                        ]
                    },
                    {
                        type: 'success',
                        clinicName: 'Pediatric Eye Clinic',
                        place: 'Room 301, Children\'s Block',
                        sessions: [
                            { id: 9, patient: 'Emma Davis', from: '13:00', to: '13:30' },
                            { id: 10, patient: 'Liam Wilson', from: '13:30', to: '14:00' },
                            { id: 11, patient: 'Olivia Taylor', from: '14:00', to: '14:30' },
                            { id: 12, patient: 'Noah Anderson', from: '14:30', to: '15:00' },
                        ]
                    },
                ];
                break;
            default:
                listData = [];
        }
        return listData;
    };

    const getMonthData = value => {

        const daysInMonth = value.daysInMonth();
        let totalSessions = 0;
        let totalClinics = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayValue = value.date(day);
            const listData = getListData(dayValue);
            totalSessions += listData.filter(item => item.type === 'success').length;
            totalClinics += listData.filter(item => item.type === 'warning').length;
        }

        if (totalSessions === 0 && totalClinics === 0) return null;
        return { totalSessions, totalClinics };
    };

    const monthCellRender = value => {

        const data = getMonthData(value);
        if (!data) return null;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0' }}>

                {data.totalSessions > 0 && (
                    <span style={{
                        fontSize: 12,
                        background: '#E1F5EE',
                        color: '#0F6E56',
                        borderRadius: 4,
                        padding: '2px 8px',
                        whiteSpace: 'nowrap',
                        display: 'inline-block'
                    }}>
                        {data.totalSessions} Clinic{data.totalSessions > 1 ? 's' : ''}
                    </span>
                )}

            </div>
        );
    };


    // load clinics based on date to show in calendar
    const GET_VISIBLE_CLINICS = gql`

        query GetVisibleClinics($startDate: Date!, $endDate: Date!, $branchId: ID!) {
            clinicCollection(
                filter: {date: {gte: $startDate, lte: $endDate}, branch_id: {eq: $branchId}}
            ) {
                edges {
                    node {
                        id
                        date
                        project {
                            id
                            branch_id
                        }
                    }
                }
            }
        }
    `;

    const [
        getVisibleClinics,
        {
            loading: clinicsLoading,
            error: clinicsError,
            data: clinicsData
        }
    ] = useLazyQuery(GET_VISIBLE_CLINICS, {
        onCompleted: (data) => {

            const grouped = {};

            data?.clinicCollection?.edges?.forEach(({ node }) => {

                if (!grouped[node.date]) {
                    grouped[node.date] = [];
                }

                grouped[node.date].push(node);

            });

            setCalendarClinics(grouped);
        }
    });

    // console.log("Visible Clinics Data:", clinicsData);
    console.log(clinicsError);

    // console.log("Calendar Clinics State:", calendarClinics);


    useEffect(() => {

        if (!branchId) return;

        // Start of visible calendar grid
        const startOfMonth = currentPanelDate.startOf('month');
        const startDate = startOfMonth.startOf('week')
        const fsd = startDate.format('YYYY-MM-DD');
        console.log("start date:", fsd);

        // End of 6-row calendar grid
        const endDate = startDate.add(41, 'day')
        const efd = endDate.format('YYYY-MM-DD');
        console.log("end date:", efd);

        console.log("Fetching clinics from", fsd, "to", efd, "for branch ID:", branchId);
        getVisibleClinics({
            variables: {
                startDate: startDate,
                endDate: endDate,
                branchId
            }
        });

    }, [currentPanelDate, branchId, getVisibleClinics]);

    const dateCellRender = (date) => {

        const formattedDate = date.format("YYYY-MM-DD");
        const clinics = calendarClinics[formattedDate] || [];

        if (clinics.length === 0) return null;

        return (
            <div
                style={{
                    marginTop: 2
                }}
            >
                <Badge
                    count={`${clinics.length} Clinic${clinics.length > 1 ? 's' : ''}`}
                    style={{
                        backgroundColor: '#378ADD',
                        fontSize: 10
                    }}
                />
            </div>
        );
    };


    const cellRender = (current, info) => {

        if (info.type === 'date') {
            return dateCellRender(current);
        }

        if (info.type === 'month') {
            return monthCellRender(current);
        }

        return info.originNode;
    };


    return (
        <>
            <Col className="mx-5">
                <Row>
                    <TopBar data={topBar} />
                </Row>


                <Row className="mt-5 ">
                    <Card title="Schedule" className="w-full">
                        <Content className="mt-5 h-[calc(100vh-40.5vh)] overflow-y-auto pr-2">
                            <Calendar
                                fullscreen={true}
                                cellRender={cellRender}
                                onSelect={daySelected}
                                onPanelChange={(date) => {
                                    setCurrentPanelDate(date);
                                }}
                            />
                        </Content>
                    </Card>
                </Row>
            </Col>

            <PrescriptionDetailsModel
                showPrescriptionDetailModal={showPrescriptionDetailModal}
                setShowPrescriptionDetailModal={setShowPrescriptionDetailModal}
            />

            {modelType === "date" && showModal && <DateClinicSessionModal show={showModal} setShow={setShowModal} dateClinicModalData={dateClinicModalData} />}
            {modelType === "month" && showModal && <MonthClinicSessionModal show={showModal} setShow={setShowModal} />}
        </>
    )
}

export default OptimetristDashboard;