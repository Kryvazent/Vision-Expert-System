import { ClockCircleOutlined, EnvironmentOutlined, TeamOutlined } from "@ant-design/icons";
import { Collapse, Modal, Tag, Typography } from "antd";



function DateClinicSessionModal({ show, setShow }) {

    const { Panel } = Collapse;         
    const { Text } = Typography;

    const items = [
        {
            key: '1',
            label: 'This is panel header 1',
            children: <p></p>,
        },
        {
            key: '2',
            label: 'This is panel header 2',
            children: <p></p>,
        },
        {
            key: '3',
            label: 'This is panel header 3',
            children: <p></p>,
        },
    ];

    return (
        <>
            <Modal
                centered
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 500 }}>
                            {/* {selectedDate?.format('dddd, D MMMM YYYY')} */}
                            12th September 2024
                        </span>
                        {/* <Tag color="blue">{selectedDayData.length} clinic{selectedDayData.length > 1 ? 's' : ''}</Tag> */}
                        <Tag color="blue">3 clinics</Tag>
                        <Tag color="green">
                            {/* {selectedDayData.reduce((acc, c) => acc + c.sessions.length, 0)} sessions */}
                            5 sessions
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
                    {/* Clinic 1 */}
                    <Panel
                        key="0"
                        header={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Text strong>Morning Eye Clinic</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <EnvironmentOutlined style={{ fontSize: 12, color: '#888' }} />
                                        <Text type="secondary" style={{ fontSize: 12 }}>Room 101, Main Building</Text>
                                    </div>
                                </div>
                                <Tag color="green" style={{ marginLeft: 'auto' }}>
                                    <TeamOutlined /> 2 sessions
                                </Tag>
                            </div>
                        }
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                            {/* Session 1 */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', background: '#f9f9f9', borderRadius: 8, border: '1px solid #f0f0f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: '#E6F1FB', color: '#185FA5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 500
                                    }}>1</div>
                                    <Text style={{ fontWeight: 500 }}>John Smith</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ClockCircleOutlined style={{ color: '#1D9E75', fontSize: 13 }} />
                                    <Text style={{ fontSize: 13 }}>
                                        08:00 <span style={{ color: '#aaa', margin: '0 4px' }}>→</span> 08:30
                                    </Text>
                                </div>
                            </div>

                            {/* Session 2 */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: '#E6F1FB', color: '#185FA5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 500
                                    }}>2</div>
                                    <Text style={{ fontWeight: 500 }}>Mary Johnson</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ClockCircleOutlined style={{ color: '#1D9E75', fontSize: 13 }} />
                                    <Text style={{ fontSize: 13 }}>
                                        08:30 <span style={{ color: '#aaa', margin: '0 4px' }}>→</span> 09:00
                                    </Text>
                                </div>
                            </div>

                        </div>
                    </Panel>

                    {/* Clinic 2 */}
                    <Panel
                        key="1"
                        header={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Text strong>Pediatric Eye Clinic</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <EnvironmentOutlined style={{ fontSize: 12, color: '#888' }} />
                                        <Text type="secondary" style={{ fontSize: 12 }}>Room 301, Children's Block</Text>
                                    </div>
                                </div>
                                <Tag color="green" style={{ marginLeft: 'auto' }}>
                                    <TeamOutlined /> 3 sessions
                                </Tag>
                            </div>
                        }
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                            {/* Session 1 */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', background: '#f9f9f9', borderRadius: 8, border: '1px solid #f0f0f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: '#E6F1FB', color: '#185FA5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 500
                                    }}>1</div>
                                    <Text style={{ fontWeight: 500 }}>Emma Davis</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ClockCircleOutlined style={{ color: '#1D9E75', fontSize: 13 }} />
                                    <Text style={{ fontSize: 13 }}>
                                        13:00 <span style={{ color: '#aaa', margin: '0 4px' }}>→</span> 13:30
                                    </Text>
                                </div>
                            </div>

                            {/* Session 2 */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: '#E6F1FB', color: '#185FA5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 500
                                    }}>2</div>
                                    <Text style={{ fontWeight: 500 }}>Liam Wilson</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ClockCircleOutlined style={{ color: '#1D9E75', fontSize: 13 }} />
                                    <Text style={{ fontSize: 13 }}>
                                        13:30 <span style={{ color: '#aaa', margin: '0 4px' }}>→</span> 14:00
                                    </Text>
                                </div>
                            </div>

                            {/* Session 3 */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', background: '#f9f9f9', borderRadius: 8, border: '1px solid #f0f0f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: '#E6F1FB', color: '#185FA5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 500
                                    }}>3</div>
                                    <Text style={{ fontWeight: 500 }}>Olivia Taylor</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ClockCircleOutlined style={{ color: '#1D9E75', fontSize: 13 }} />
                                    <Text style={{ fontSize: 13 }}>
                                        14:00 <span style={{ color: '#aaa', margin: '0 4px' }}>→</span> 14:30
                                    </Text>
                                </div>
                            </div>

                        </div>
                    </Panel>

                </Collapse>
            </Modal>
        </>
    )
}

export default DateClinicSessionModal;