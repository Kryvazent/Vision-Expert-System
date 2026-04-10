import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Input, Radio, Row } from "antd";
import { useState } from "react";
import ExistingPatientSearch from "../../component/optimetrist/new-prescription/ExistingPatientSearch";
import NewPatientAdd from "../../component/optimetrist/new-prescription/NewPatientAdd";
import TextArea from "antd/es/input/TextArea";

function NewPrescription() {
    const [position, setPosition] = useState("start");

    return (
        <div className="m-5">
            <Card title="New Prescription">

                <Row gutter={16}>
                    
                    {/* LEFT SIDE - PRESCRIPTION DETAILS */}
                    <Col span={16}>
                        <p className="fs-5 font-semibold mb-2">Right Eye (OD)</p>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input placeholder="Sphere (SPH)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" />
                            </Col>
                        </Row>

                        <p className="fs-5 font-semibold mt-10 mb-2">Left Eye (OS)</p>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input placeholder="Sphere (SPH)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <p className="fs-5 font-semibold mt-10 mb-2">
                                    Pupillary Distance (PD)
                                </p>
                                <Input placeholder="Pupillary Distance (PD)" />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-10 mb-2">Notes</p>
                                <TextArea rows={4} />
                            </Col>
                        </Row>
                    </Col>

                    <Col span={1} className="flex justify-center">
                        <Divider type="vertical" style={{ height: "100%" }} />
                    </Col>

                    {/* RIGHT SIDE - PATIENT TYPE */}
                    <Col span={7}>
                        <p className="fs-5 font-semibold mb-2">Patient Type</p>

                        <Radio.Group
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                        >
                            <Radio.Button value="start">
                                <SearchOutlined /> Existing Patient
                            </Radio.Button>
                            <Radio.Button value="end">
                                <UserAddOutlined /> New Patient
                            </Radio.Button>
                        </Radio.Group>

                        <Divider />

                        {position === "start" && <ExistingPatientSearch />}
                        {position === "end" && <NewPatientAdd />}
                    </Col>

                </Row>
            </Card>
        </div>
    );
}

export default NewPrescription;