import { Col, Row } from "antd";
import StatCard from "./StatCard";

import person from "../../assets/icons/optimetrist/person.png";
import prescription from "../../assets/icons/optimetrist/prescriptions.png";
import appointments from "../../assets/icons/optimetrist/appointment.png";

function TopBar() {
    return (
        <Row align="middle" justify={"start"} className="mt-5 gap-9">
            <Col>
                <StatCard title="Today's Patients" value="0" icon={person} />
            </Col>
            <Col>
                <StatCard title="New Prescriptions" value="0" icon={prescription} />
            </Col>
            <Col>
                <StatCard title="Appointments" value="0" icon={appointments} />
            </Col>
        </Row>
    )
}

export default TopBar;