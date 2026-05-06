import { ClockCircleOutlined, EnvironmentOutlined, TeamOutlined } from "@ant-design/icons";
import { Collapse, Modal, Tag, Typography } from "antd";



function DateClinicSessionModal({ show, setShow, dateClinicSessionModalData }) {

    const { Panel } = Collapse;
    const { Text } = Typography;

    console.log('DateClinicSessionModalData:', dateClinicSessionModalData.clinicAndSessionList);

    return (
        <>
            <Modal
                centered
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 500 }}>
                            {/* {selectedDate?.format('dddd, D MMMM YYYY')} */}
                            {dateClinicSessionModalData.date}
                        </span>
                        {/* <Tag color="blue">{selectedDayData.length} clinic{selectedDayData.length > 1 ? 's' : ''}</Tag> */}
                        <Tag color="blue">{dateClinicSessionModalData.clinicCount} clinics</Tag>
                        <Tag color="green">
                            {/* {selectedDayData.reduce((acc, c) => acc + c.sessions.length, 0)} sessions */}
                            {dateClinicSessionModalData.sessionCount} sessions
                        </Tag>
                    </div>
                }
                open={show}
                onCancel={() => setShow(false)}
                onOk={() => setShow(false)}
                width={640}
                styles={{
                    body: {
                        maxHeight: '65vh',
                        overflowY: 'auto',
                        paddingRight: 8,
                    }
                }}
            >

                <Collapse
                    defaultActiveKey={['0', '1']}
                    expandIconPosition="end"
                    style={{ marginTop: 8 }}
                >
                    {dateClinicSessionModalData.clinicAndSessionList.map((clinic, index) => {
                        console.log('Clinic:', clinic);

                        return (
                            <Panel
                                key={index}
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Text strong>{clinic.clinicName}</Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <EnvironmentOutlined style={{ fontSize: 12, color: '#888' }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {clinic.clinicVenue}
                                                </Text>
                                            </div>
                                        </div>

                                        <Tag color="green">
                                            <TeamOutlined /> {clinic.sessions.length} sessions
                                        </Tag>
                                    </div>
                                }
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {clinic.sessions.map((session, sIndex) => (
                                        <div
                                            key={sIndex}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                background: '#f9f9f9',
                                                borderRadius: 8,
                                                border: '1px solid #f0f0f0'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        background: '#E6F1FB',
                                                        color: '#185FA5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 12,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {sIndex + 1}
                                                </div>

                                                <Text style={{ fontWeight: 500 }}>
                                                    {session.name || "No Name"}
                                                </Text>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <ClockCircleOutlined style={{ color: '#1D9E75', fontSize: 13 }} />
                                                <Text style={{ fontSize: 13 }}>
                                                    {session.from} <span style={{ color: '#aaa', margin: '0 4px' }}>→</span> {session.to}
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    })}
                </Collapse>
            </Modal>
        </>
    )
}

export default DateClinicSessionModal;