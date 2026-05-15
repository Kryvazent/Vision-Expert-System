import { Alert, Button, Card, Col, Collapse, Input, Radio, Row, Select, Steps, Tag } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useMemo, useState } from "react";
import DigitalSignature from "../../component/sales-executive/new-order/DigitalSignature";
import Fingerprint from "../../component/sales-executive/new-order/Fingerprint";
import ExistingPatientSearch from "../../component/optimetrist/new-prescription/ExistingPatientSearch";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useAuth } from "../../const/functions";
import ProjectAndClinicSelect from "../../component/optimetrist/new-prescription/ProjectAndClinicSelect";

function NewOrder() {
    const [current, setCurrent] = useState(0);
    const [position, setPosition] = useState("start");
    
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    const [selectedFrameTypeId, setSelectedFrameTypeId] = useState(null);
    const [selectedFrameId, setSelectedFrameId] = useState(null);
    const [selectedFramePrice, setSelectedFramePrice] = useState(0);
    const [selectedLenseTypeId, setSelectedLenseTypeId] = useState(null);
    const [selectedLenseTypePrice, setSelectedLenseTypePrice] = useState(0);

    const [additionalPrice, setAdditionalPrice] = useState(0);
    const [advancePayment, setAdvancePayment] = useState(500);
    const [paidAmount, setPaidAmount] = useState(0);


    const { staff } = useAuth();

    const handleOrderSubmit = () => {
        console.log("Order submitted!");
    }

    // lense type
    const GET_LENSE_TYPE = gql`
    
        query getLenseType{
            lense_typeCollection{
                edges{
                    node{
                        id
                        type
                        price
                    }
                }
            }
        }
    `;
    const [getLenseType, { data: lenseTypeData, error: lenseTypeError }] = useLazyQuery(GET_LENSE_TYPE);

    const lenseTypes = useMemo(() => {
        return lenseTypeData?.lense_typeCollection?.edges?.map(e => e.node) || []
    }, [lenseTypeData]);

    // frames
    const GET_FRAMES = gql`
    
        query getFrames($frameTypeId: ID!){
            frameCollection(filter:{frame_type_id:{eq:$frameTypeId}}){
                edges{
                    node{
                        id
                        color
                        serial_no
                        product{
                            id
                            selling_price
                        }
                    }
                }
            }
        }
    `;
    const [getFrames, { data: framesData, error: framesError }] = useLazyQuery(GET_FRAMES);

    const frames = useMemo(() => {
        return framesData?.frameCollection?.edges?.map(e => e.node) || []
    }, [framesData]);

    useEffect(() => {
        if (selectedFrameTypeId) {
            getFrames({ variables: { frameTypeId: selectedFrameTypeId } });
        }
    }, [selectedFrameTypeId, getFrames]);

    // frame types
    const GET_FRAME_TYPES = gql`
    
        query getFrameTypes{
            frame_typeCollection{
                edges{
                    node{
                        id
                        type
                    }
                }
            }
        }
    `;
    const [getFrameTypes, { data: frameTypesData, error: frameTypesError }] = useLazyQuery(GET_FRAME_TYPES);


    const frameTypes = useMemo(() => {
        return frameTypesData?.frame_typeCollection?.edges?.map(e => e.node) || []
    }, [frameTypesData]);


    // prescription
    const GET_PRESCRIPTIONS = gql`
    
        query getPrescription($customerId: ID!,$branchId: ID!,$clinicId: ID!){ 
            customerCollection(filter: {id: {eq: $customerId}}) {
                edges {
                    node {
                        id
                        customer_has_branchCollection(filter: {branch_id: {eq: $branchId}}) {
                            edges {
                                node {
                                    clinic_attend_customerCollection(filter: {clinic_id: {eq: $clinicId}}) {
                                        edges {
                                            node {
                                                prescriptionCollection {
                                                    edges {
                                                        node {
                                                            id
                                                            created_at
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    `;
    const [getPrescriptions, { data: prescriptionsData, error: prescriptionsError }] = useLazyQuery(GET_PRESCRIPTIONS);

    const prescriptions = useMemo(() => {
        return prescriptionsData?.customerCollection?.edges?.[0]?.node?.customer_has_branchCollection?.edges?.[0]?.node?.clinic_attend_customerCollection?.edges?.[0]?.node?.prescriptionCollection?.edges || [];
    }, [prescriptionsData])

    const prescriptionSelectOptions = useMemo(() => {

        return prescriptions?.map(({ node }) => ({
            value: node.id,
            label: `ID: ${node.id} - ${new Date(node.created_at).toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}`,
            node,
        })) || [];

    }, [prescriptions])



    const handleStepChange = async () => {
        let moveToNext = false;

        if (current == 0) {
            if (selectedProject != null && selectedClinic != null && selectedPatient != null) {

                await getPrescriptions({
                    variables: {
                        customerId: selectedPatient.id,
                        branchId: staff?.branch?.id,
                        clinicId: selectedClinic,
                    }
                });

                moveToNext = true;
            }
        }

        if (current == 1) {
            if (selectedPrescription != null) {
                await getLenseType();
                await getFrameTypes();
                moveToNext = true;
            }
        }

        if (current == 2) {
            if (selectedFrameTypeId != null && selectedFrameId != null && selectedLenseTypeId != null) {
                moveToNext = true;
            }
        }

        if(current == 3){
            if(paidAmount > 0 && advancePayment >= 0 && selectedFramePrice > 0 && selectedLenseTypePrice > 0 && additionalPrice >= 0){
                moveToNext = true;
            }
        }

        if (moveToNext) {
            setCurrent(current + 1);
        } else {
            alert("Please complete all required selections before proceeding to the next step.");
        }
    }

    return (
        <>
            <div className="m-5 w-5xl flex flex-col gap-2">

                <ProjectAndClinicSelect
                    setSelectedClinic={setSelectedClinic}
                    selectedClinic={selectedClinic}
                    setSelectedProject={setSelectedProject}
                    selectedProject={selectedProject}
                    setIsDisabled={setIsDisabled}
                />

                <Card title="New Order">

                    <Steps
                        current={current}
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

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={24}>
                                <ExistingPatientSearch onPatientSelect={setSelectedPatient} getSelectedPatient={selectedPatient} />
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
                                    placeholder="Search by Prescription ID"
                                    options={prescriptionSelectOptions}
                                    onChange={(value) => {
                                        setSelectedPrescription(prescriptions.find(p => p.node.id === value))
                                    }}
                                    onSelect={(value) => {
                                        // console.log("Selected Prescription ID: ", value);
                                        const prescription = prescriptions.find(p => p.node.id === value)
                                        //console.log("Selected Prescription: ", prescription);
                                        if (prescription) {
                                            setSelectedPrescription(prescription);
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                    </Content>

                    <Content hidden={current !== 2} className="mt-10">
                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={10}>

                                <p className="font-semibold">Select Frame Type</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Select Frame Type"
                                    options={frameTypes.map(ft => ({
                                        value: ft.id,
                                        label: ft.type,
                                    }))}
                                    onSelect={(value) => {
                                        setSelectedFrameTypeId(value);
                                    }}
                                />
                            </Col>

                            <Col span={10}>

                                <p className="font-semibold">Select Frame</p>
                                <Select
                                    disabled={selectedFrameTypeId == null}
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Search Frame"
                                    options={frames.map(f => ({
                                        value: f.id,
                                        label: `Serial No: ${f.serial_no} - Color: ${f.color}`,
                                    }))}
                                    onSelect={(value)=>{
                                        setSelectedFrameId(value);
                                        const frame = frames.find(f => f.id === value);
                                        console.log("Selected frame: ", frame);
                                        if (frame) {
                                            setSelectedFramePrice(frame.product.selling_price);
                                        }
                                    }} 
                                />
                            </Col>
                        </Row>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={10}>

                                <p className="font-semibold">Select Lense Type</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    placeholder="Select Lense Type"
                                    options={lenseTypes.map(lt => ({
                                        value: lt.id,
                                        label: lt.type,
                                    }))}
                                    onSelect={(value)=>{
                                        setSelectedLenseTypeId(value);
                                        const lenseType = lenseTypes.find(lt => lt.id === value);
                                        console.log("Selected lense type: ", lenseType);
                                        if (lenseType) {
                                            setSelectedLenseTypePrice(lenseType.price);
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                    </Content>

                    <Content hidden={current !== 3} className="mt-10">

                        <Row className="ms-5 flex flex-row gap-2">
                            <Col span={4}>
                                <p className="fs-5 font-semibold mt-5 mb-2">
                                    Frame & Lense Price
                                </p>
                                <Input type={"number"} prefix="Rs." value={selectedFramePrice+selectedLenseTypePrice} disabled/>
                            </Col>

                            <Col span={4}>
                                <p className="fs-5 font-semibold mt-5 mb-2">
                                    Additional Amount
                                </p>
                                <Input autoFocus={true} type={"number"} prefix="Rs." value={additionalPrice} onChange={(e)=>setAdditionalPrice(Number(e.target.value))}/>
                            </Col>

                            <Col span={4}>
                                <p className="fs-5 font-semibold mt-5 mb-2">
                                    Advance Payment
                                </p>
                                <Input type={"number"} prefix="Rs." value={advancePayment} onChange={(e)=>setAdvancePayment(Number(e.target.value))}/>
                            </Col>

                            <Col span={4}>
                                <p className="fs-5 font-semibold mt-5 mb-2">
                                    Total Payment (Today)
                                </p>
                                <Input type={"number"} prefix="Rs." placeholder="Enter amount received" value={paidAmount} onChange={(e)=>setPaidAmount(Number(e.target.value))}/>
                            </Col>

                            <Col span={4}>

                                <p className="font-semibold mt-5 mb-2">Payment Method</p>
                                <Select
                                    className="w-full"
                                    showSearch={{
                                        filterOption: (input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                                    }}
                                    options={[
                                        { value: '1', label: 'Cash' },
                                        { value: '2', label: 'Card' },
                                        { value: '3', label: 'Bank Transfer' },
                                    ]}
                                    defaultValue={"Cash"}
                                />
                            </Col>
                        </Row>

                        <Row className="ms-5 mt-5">
                            <Col span={21}>
                                <Tag color="blue" variant="outlined" className="w-full ">

                                    <Row justify={"space-between"} className="px-5 py-3">

                                        <Col>
                                            <p className="text-gray-600">Total Amount</p>
                                            <p className="font-bold text-black text-2xl">Rs. {(selectedFramePrice+selectedLenseTypePrice+additionalPrice).toFixed(2)}</p>
                                        </Col>
                                        <Col>
                                            <p className="text-gray-600">Advance Payment</p>
                                            <p className="font-bold text-green-600 text-2xl">Rs. {advancePayment.toFixed(2)}</p>
                                        </Col>
                                        <Col>
                                            <p className="text-gray-600">Balance Due</p>
                                            <p className="font-bold text-red-600 text-2xl">Rs. {((selectedFramePrice+selectedLenseTypePrice+additionalPrice) - paidAmount).toFixed(2)}</p>
                                        </Col>

                                    </Row>

                                </Tag>
                            </Col>
                        </Row>

                        <Row className="gap-3 mt-5 ms-5">
                            
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

                    <Row className="gap-3 ms-5 mt-5">
                        <Col span={24}>
                            {current > 0 && !isDisabled && (
                                <Button className="me-5" type="dashed" onClick={() => setCurrent(current - 1)}>
                                    Previous
                                </Button>
                            )}

                            {current < 4 && !isDisabled && (
                                <Button disabled={isDisabled} type="primary" onClick={handleStepChange}>
                                    Next
                                </Button>
                            )}

                            {current == 4 && !isDisabled && (
                                <Button disabled={isDisabled} type="primary" onClick={handleOrderSubmit}>
                                    Complete Order
                                </Button>
                            )}


                        </Col>
                    </Row>

                </Card>
            </div>
        </>
    )
}

export default NewOrder;