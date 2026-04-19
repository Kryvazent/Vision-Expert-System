import { Card, Col, Image, Row } from "antd";

function StatCard({ title, value, icon }) {
    return (
        <Card variant="borderless">
            <Row align="middle" wrap={false} gutter={16}>

                <Col>
                    <p className="text-nowrap text-neutral-400">{title}</p>
                    <p className="font-bold text-2xl">{value}</p>
                </Col>
                <Col>
                    <Image
                        src={icon}
                    />
                </Col>

            </Row>
        </Card>
    );
}

export default StatCard;