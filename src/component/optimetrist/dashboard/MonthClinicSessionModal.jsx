import { ClockCircleOutlined, EnvironmentOutlined, TeamOutlined } from "@ant-design/icons";
import { Collapse, Modal, Tag, Typography } from "antd";

const { Panel } = Collapse;
const { Text } = Typography;

function MonthClinicSessionModal({ show, setShow }) {

    return (
        <>
            <Modal
                centered
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 500 }}>
                            September 2024
                        </span>
                        <Tag color="blue">3 clinics</Tag>
                        <Tag color="green">5 sessions</Tag>
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
                {/* ── Level 1: Date ── */}
                <Collapse
                    defaultActiveKey={['date-8', 'date-15']}
                    expandIconPosition="end"
                    style={{ marginTop: 8 }}
                >

                    {/* ── Date: 8th September ── */}
                    <Panel
                        key="date-8"
                        header={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                                <Text strong style={{ fontSize: 14 }}>8th September 2024</Text>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Tag color="blue">1 clinic</Tag>
                                    <Tag color="green">2 sessions</Tag>
                                </div>
                            </div>
                        }
                    >
                        {/* ── Level 2: Clinics under this date ── */}
                        <Collapse
                            defaultActiveKey={['clinic-8-1']}
                            expandIconPosition="end"
                            style={{ background: 'transparent', border: 'none' }}
                        >
                            <Panel
                                key="clinic-8-1"
                                style={{ borderRadius: 8, marginBottom: 4 }}
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
                                {/* ── Level 3: Sessions ── */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

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
                        </Collapse>
                    </Panel>

                    {/* ── Date: 15th September ── */}
                    <Panel
                        key="date-15"
                        header={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                                <Text strong style={{ fontSize: 14 }}>15th September 2024</Text>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Tag color="blue">2 clinics</Tag>
                                    <Tag color="green">3 sessions</Tag>
                                </div>
                            </div>
                        }
                    >
                        <Collapse
                            defaultActiveKey={['clinic-15-1', 'clinic-15-2']}
                            expandIconPosition="end"
                            style={{ background: 'transparent', border: 'none' }}
                        >

                            {/* Clinic 1 under 15th */}
                            <Panel
                                key="clinic-15-1"
                                style={{ borderRadius: 8, marginBottom: 4 }}
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Text strong>Specialist Clinic</Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <EnvironmentOutlined style={{ fontSize: 12, color: '#888' }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>Suite 3, West Wing</Text>
                                            </div>
                                        </div>
                                        <Tag color="green" style={{ marginLeft: 'auto' }}>
                                            <TeamOutlined /> 1 session
                                        </Tag>
                                    </div>
                                }
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                                            <Text style={{ fontWeight: 500 }}>Bob Martin</Text>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ClockCircleOutlined style={{ color: '#1D9E75', fontSize: 13 }} />
                                            <Text style={{ fontSize: 13 }}>
                                                10:00 <span style={{ color: '#aaa', margin: '0 4px' }}>→</span> 11:00
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            {/* Clinic 2 under 15th */}
                            <Panel
                                key="clinic-15-2"
                                style={{ borderRadius: 8, marginBottom: 4 }}
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
                                            <TeamOutlined /> 2 sessions
                                        </Tag>
                                    </div>
                                }
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

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
                    </Panel>

                </Collapse>
            </Modal>
        </>
    );
}

export default MonthClinicSessionModal;