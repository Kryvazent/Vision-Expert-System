import { Card, Col, Image, Row } from "antd";

function StatCard({ title, value, icon, iconSVG, bg }) {
    return (
        <Card variant="borderless">
            <Row align="middle" wrap={false} gutter={16}>

                <Col>
                    <p className="text-nowrap text-neutral-400">{title}</p>
                    <p className="font-bold text-2xl">{value}</p>
                </Col>
                <Col>
                    <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        {iconSVG || (
                            <Image
                                src={icon}
                            />
                        )}
                    </div>
                </Col>

            </Row>
        </Card>
    );
}

export default StatCard;