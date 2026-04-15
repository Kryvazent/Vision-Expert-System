import { Alert, Card, Col, Input, Radio, Row, Select, Steps, Tag } from "antd";
import { Content } from "antd/es/layout/layout";
import { useState } from "react";
import DigitalSignature from "../../component/sales-executive/new-order/DigitalSignature";
import Fingerprint from "../../component/sales-executive/new-order/Fingerprint";

function NewOrder() {
    const [current, setCurrent] = useState(0);
    const [position, setPosition] = useState("start");

    const onChange = value => {
        console.log('onChange:', value);
        setCurrent(value);
    };

    return (
        <>
            <div className="m-5 w-5xl">
                <Card title="New Order">

                    <Steps
                        current={current}
                        onChange={onChange}
                        items={[
                            {
                                title: 'Customer',
                            },
                            {
                                title: 'Prescription',
                            },
                            {
                                title: 'Spectacles',
                            },
                            {
                                title: 'Payment',
                            },
                            {
                                title: 'Verification',
                            }
                        ]}
                    />


                    <Content hidden={current !== 0} className="mt-10">
                        <Row className="gap-3 ms-5">
                            <Col span={24}>

                                <p className="font-semibold">Select Customet</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Search by NIC"
                                    options={[
                                        { value: '1', label: 'Jack' },
                                        { value: '2', label: 'Lucy' },
                                        { value: '3', label: 'Tom' },
                                    ]}
                                />
                            </Col>
                        </Row>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={24}>

                                <p className="font-semibold">Branch</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Search by NIC"
                                    options={[
                                        { value: '1', label: 'Jack' },
                                        { value: '2', label: 'Lucy' },
                                        { value: '3', label: 'Tom' },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Content>

                    <Content hidden={current !== 1} className="mt-10">
                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={12}>

                                <p className="font-semibold">Select Prescription</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Search by NIC"
                                    options={[
                                        { value: '1', label: 'Jack' },
                                        { value: '2', label: 'Lucy' },
                                        { value: '3', label: 'Tom' },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Content>

                    <Content hidden={current !== 2} className="mt-10">
                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={24}>

                                <p className="font-semibold">Select Frame</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Search by NIC"
                                    options={[
                                        { value: '1', label: 'Jack' },
                                        { value: '2', label: 'Lucy' },
                                        { value: '3', label: 'Tom' },
                                    ]}
                                />
                            </Col>
                        </Row>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={24}>

                                <p className="font-semibold">Select Lense</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Search by NIC"
                                    options={[
                                        { value: '1', label: 'Jack' },
                                        { value: '2', label: 'Lucy' },
                                        { value: '3', label: 'Tom' },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Content>

                    <Content hidden={current !== 3} className="mt-10">

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-5 mb-2">
                                    Total Amount
                                </p>
                                <Input type={"number"} prefix="Rs." />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-5 mb-2">
                                    Advance Payment
                                </p>
                                <Input type={"number"} prefix="Rs." />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-5 mb-2">
                                    Paid Amount (Today)
                                </p>
                                <Input type={"number"} prefix="Rs." placeholder="Enter amount received" />
                                <p className="text-gray-400">Amount customer is paying right now</p>
                            </Col>
                        </Row>

                        <Row className="mt-5">
                            <Col span={24}>
                                <Tag color="blue" variant="outlined" className="w-full ">

                                    <Row justify={"space-between"} className="px-5 py-3">

                                        <Col>
                                            <p className="text-gray-600">Total Amount</p>
                                            <p className="font-bold text-black text-2xl">Rs. 0</p>
                                        </Col>
                                        <Col>
                                            <p className="text-gray-600">Advance Payment</p>
                                            <p className="font-bold text-green-600 text-2xl">Rs. 0</p>
                                        </Col>
                                        <Col>
                                            <p className="text-gray-600">Balance Due</p>
                                            <p className="font-bold text-red-600 text-2xl">Rs. 0</p>
                                        </Col>

                                    </Row>

                                </Tag>
                            </Col>
                        </Row>

                        <Row className="gap-3 mt-5">
                            <Col span={24}>

                                <p className="font-semibold">Payment Method</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    options={[
                                        { value: '1', label: 'Jack' },
                                        { value: '2', label: 'Lucy' },
                                        { value: '3', label: 'Tom' },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Content>

                    <Content hidden={current !== 4} className="mt-10">

                        <Alert
                            title="Customer Verification Required"
                            description="Please collect customer's digital signature or fingerprint to complete the order."
                            type="info"
                            showIcon
                        />

                        <p className="fs-5 font-semibold mb-2 mt-4">Verification Method</p>

                        <Radio.Group
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                        >
                            <Radio.Button value="start">
                                Digital Signature
                            </Radio.Button>
                            <Radio.Button value="end">
                                Fingerprint
                            </Radio.Button>
                        </Radio.Group>

                        <Content className="mt-5">
                            {position === "start" && <DigitalSignature />}
                            {position === "end" && <Fingerprint />}
                        </Content>

                    </Content>

                </Card>
            </div>
        </>
    )
}

export default NewOrder;