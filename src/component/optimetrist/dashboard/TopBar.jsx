import { Col, Row } from "antd";
import StatCard from "./StatCard";


function TopBar({ data }) {
    return (
        <Row align="middle" justify="start" className="mt-5 gap-9">
            {
                data.map((obj, index) => (
                    <Col key={index}>
                        <StatCard 
                            title={obj.title} 
                            value={obj.value} 
                            icon={obj.icon} 
                            iconSVG={obj.iconSVG}
                            bg={obj.bg}
                        />
                    </Col>
                ))
            }
        </Row>
    );
}

export default TopBar;