import { Col, Input, Row } from "antd";

function NewPatientAdd() {
  return (
    <>

        <Row className="gap-3">
            <Col span={10}>
                <p className="font-semibold">Patient Name</p>
                <Input placeholder="Patient Name" />
            </Col>
            <Col span={10}>
                <p className="font-semibold">Age</p>
                <Input type={"number"} placeholder="Patient Age" />
            </Col>
        </Row>
        <Row className="mt-2 gap-3">
            <Col span={10}>
                <p className="font-semibold">NIC Number</p>
                <Input placeholder="NIC Number" />
            </Col>
            <Col span={10}>
                <p className="font-semibold">Phone Number</p>
                <Input placeholder="Phone Number" />
            </Col>
        </Row>
        
    </>
  );
}

export default NewPatientAdd;