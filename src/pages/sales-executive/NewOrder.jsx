import { Alert, Button, Card, Checkbox, Col, Collapse, Descriptions, Divider, Input, Radio, Row, Select, Steps, Tag } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useMemo, useState } from "react";
import DigitalSignature from "../../component/sales-executive/new-order/DigitalSignature";
import Fingerprint from "../../component/sales-executive/new-order/Fingerprint";
import ExistingPatientSearch from "../../component/optimetrist/new-prescription/ExistingPatientSearch";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";
import ProjectAndClinicSelect from "../../component/optimetrist/new-prescription/ProjectAndClinicSelect";
import TextArea from "antd/es/input/TextArea";

function NewOrder() {
    const [current, setCurrent] = useState(0);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null); 
    const [selectedFrameTypeId, setSelectedFrameTypeId] = useState(null);
    const [selectedFrameId, setSelectedFrameId] = useState(null);
    const [selectedFramePrice, setSelectedFramePrice] = useState(0);
    const [selectedLenseTypeId, setSelectedLenseTypeId] = useState(null);
    const [selectedLenseTypePrice, setSelectedLenseTypePrice] = useState(0);
    const [additionalPrice, setAdditionalPrice] = useState(0);
    const [advancePayment, setAdvancePayment] = useState(500);
    const [paidAmount, setPaidAmount] = useState(0);
    const [agraharaApplied, setAgraharaApplied] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [warrantyMonths, setWarrantyMonths] = useState(0);
    const [clinicAttendCustomerId, setClinicAttendCustomerId] = useState(null);
    const [discount, setDiscount] = useState(0);

    const { staff } = useAuth();

    // add warranty
    const ADD_WARRANTY = gql`
        mutation addWarranty($months: Int!){
            insertIntowarrantyCollection(
                objects:{
                    month: $months
                }
            ){
                records{
                    id
                }
            }
        }
  `;
    const [addWarranty, { data: warrantyData, error: warrantyError }] = useMutation(ADD_WARRANTY);

    // payment
    const ADD_PAYMENT = gql`
    
        mutation addPayment($totalPayment: Float!, $remarks: String!, $orderId: ID!, $discount: Float!,$additionalFee: Float!,$advance: Float!){
            insertIntopaymentCollection(
                objects:{
                    total_payment: $totalPayment,
                    remarks: $remarks,
                    order_id: $orderId,
                    discount: $discount,
                    additional_fee: $additionalFee,
                    advance: $advance
                }
            ){
                records{
                    id
                }
            }
        }
    `;
    const [addPayment, { data: paymentData, error: paymentError }] = useMutation(ADD_PAYMENT);

    // order submit
    const CREATE_ORDER = gql`
        mutation createOrder(
            $agraharaApplied: Boolean,$prescriptionId: ID!,
            $remarks: String!,$warrantyId: Int!,$clinicAttendCustomerId:ID!,$frameId: ID!,$lenseTypeId: ID!, $frameTypeId: ID!,$totalPrice: Float!
        ){
            insertIntoorderCollection(
                objects:{
                    agrahara_applied: $agraharaApplied,
                    remarks: $remarks,
                    clinic_attend_customer_id: $clinicAttendCustomerId,
                    warranty_id: $warrantyId,
                    prescription_id: $prescriptionId,
                    lens_type_id: $lenseTypeId,
                    frame_type_id: $frameTypeId,
                    frame_id: $frameId,
                    total_price:$totalPrice
                }
            ){
                records{
                    id
                }
            }
        }
  `;
    const [createOrder, { data: orderData, error: orderError }] = useMutation(CREATE_ORDER);


    const handleOrderSubmit = async () => {
        if (
            selectedClinic &&
            selectedProject &&
            selectedPatient &&
            selectedPrescription &&
            selectedFrameTypeId &&
            selectedFrameId &&
            selectedLenseTypeId &&
            paidAmount > 0 &&
            advancePayment >= 0 &&
            selectedFramePrice > 0 &&
            selectedLenseTypePrice > 0 &&
            additionalPrice >= 0
        ) {
            try {
                // 1. Add warranty
                const warrantyResult = await addWarranty({
                    variables: { months: warrantyMonths }
                });
                const warrantyId = warrantyResult.data.insertIntowarrantyCollection.records[0].id;

                // 2. Create order
                const totalPayment = selectedFramePrice + selectedLenseTypePrice + additionalPrice;
                const orderResult = await createOrder({
                    variables: {
                        agraharaApplied: false,
                        remarks: remarks,
                        warrantyId: warrantyId,
                        clinicAttendCustomerId: clinicAttendCustomerId,
                        totalPrice: totalPayment,
                        prescriptionId: selectedPrescriptionId,
                        frameId: selectedFrameId,
                        lenseTypeId: selectedLenseTypeId,
                        frameTypeId: selectedFrameTypeId
                    }
                });
                const orderId = orderResult.data.insertIntoorderCollection.records[0].id;

                // 3. Add payment
                await addPayment({
                    variables: {
                        totalPayment: totalPayment,
                        remarks: remarks,
                        orderId: orderId,
                        discount: discount,
                        additionalFee: additionalPrice,
                        advance: advancePayment
                    }
                })
                

                alert("Order submitted successfully!");

                // Reset all state
                setCurrent(0);
                setSelectedPatient(null);
                setSelectedPrescription(null);
                setSelectedPrescriptionId(null); 
                setSelectedFrameTypeId(null);
                setSelectedFrameId(null);
                setSelectedLenseTypeId(null);
                setSelectedFramePrice(0);
                setSelectedLenseTypePrice(0);
                setAdditionalPrice(0);
                setAdvancePayment(500);
                setPaidAmount(0);
                setAgraharaApplied(false);
                setRemarks("");
                setWarrantyMonths(0);
                setClinicAttendCustomerId(null);

            } catch (error) {
                console.error("Error during order submission: ", error);
                alert("An error occurred while submitting the order. Please try again.");
                return;
            }
        } else {
            alert("Please complete all required selections and inputs before submitting the order.");
        }
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
                                                id
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

    useEffect(() => {
        setClinicAttendCustomerId(prescriptionsData?.customerCollection?.edges?.[0]?.node?.customer_has_branchCollection?.edges?.[0]?.node?.clinic_attend_customerCollection?.edges?.[0]?.node?.id);
    }, [setClinicAttendCustomerId, prescriptionsData])

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

        if (current == 3) {
            if (paidAmount > 0 && advancePayment >= 0 && selectedFramePrice > 0 && selectedLenseTypePrice > 0 && additionalPrice >= 0) {
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
                <Card title="New Order" style={{ maxHeight: '65vh', overflowY: 'scroll' }}>
                    <Steps
                        current={current}
                        items={[
                            { title: 'Customer' },
                            { title: 'Prescription' },
                            { title: 'Spectacles' },
                            { title: 'Payment' },
                            { title: 'Verification' }
                        ]}
                    />

                    <Content hidden={current !== 0} className="mt-10">
                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={24}>
                                <ExistingPatientSearch
                                    onPatientSelect={setSelectedPatient}
                                    getSelectedPatient={selectedPatient}
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
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    placeholder="Search by Prescription ID"
                                    options={prescriptionSelectOptions}
                                    value={selectedPrescriptionId} // controlled value using ID
                                    onChange={(value) => {
                                        setSelectedPrescriptionId(value); // track selected prescription ID
                                        const prescription = prescriptions.find(p => p.node.id === value);
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
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    placeholder="Select Frame Type"
                                    options={frameTypes.map(ft => ({
                                        value: ft.id,
                                        label: ft.type,
                                    }))}
                                    value={selectedFrameTypeId} // use ID directly
                                    onChange={(value) => {
                                        setSelectedFrameTypeId(value);
                                        // Reset frame selection when frame type changes
                                        setSelectedFrameId(null);
                                        setSelectedFramePrice(0);
                                    }}
                                />
                            </Col>
                            <Col span={10}>
                                <p className="font-semibold">Select Frame</p>
                                <Select
                                    disabled={selectedFrameTypeId == null}
                                    className="w-full"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    placeholder="Search Frame"
                                    options={frames.map(f => ({
                                        value: f.id,
                                        label: `Serial No: ${f.serial_no} - Color: ${f.color}`,
                                    }))}
                                    value={selectedFrameId} // use ID directly
                                    onChange={(value) => {
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
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    placeholder="Select Lense Type"
                                    options={lenseTypes.map(lt => ({
                                        value: lt.id,
                                        label: lt.type,
                                    }))}
                                    value={selectedLenseTypeId} // use ID directly
                                    onChange={(value) => {
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
                                <p className="fs-5 font-semibold mt-5 mb-2">Frame & Lense Price</p>
                                <Input
                                    type={"number"}
                                    prefix="Rs."
                                    value={selectedFramePrice + selectedLenseTypePrice}
                                    disabled
                                />
                            </Col>
                            <Col span={4}>
                                <p className="fs-5 font-semibold mt-5 mb-2">Additional Amount</p>
                                <Input
                                    autoFocus={true}
                                    type={"number"}
                                    prefix="Rs."
                                    value={additionalPrice}
                                    onChange={(e) => setAdditionalPrice(Number(e.target.value))}
                                />
                            </Col>
                            <Col span={4}>
                                <p className="fs-5 font-semibold mt-5 mb-2">Advance Payment</p>
                                <Input
                                    type={"number"}
                                    prefix="Rs."
                                    value={advancePayment}
                                    onChange={(e) => setAdvancePayment(Number(e.target.value))}
                                />
                            </Col>
                            <Col span={4}>
                                <p className="fs-5 font-semibold mt-5 mb-2">Total Payment (Today)</p>
                                <Input
                                    type={"number"}
                                    prefix="Rs."
                                    placeholder="Enter amount received"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                                />
                            </Col>
                            <Col span={4}>
                                <p className="font-semibold mt-5 mb-2">Payment Method</p>
                                <Select
                                    className="w-full"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={[
                                        { value: '1', label: 'Cash' },
                                        { value: '2', label: 'Card' },
                                        { value: '3', label: 'Bank Transfer' },
                                    ]}
                                    defaultValue={"Cash"}
                                />
                            </Col>
                            <Col span={4}>
                                <p className="font-semibold mb-2 mt-3">Warranty (Months)</p>
                                <Input
                                    type={"number"}
                                    suffix="Months"
                                    value={warrantyMonths}
                                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                                />
                                <Checkbox
                                    style={{ marginTop: 25, marginBottom: 5 }}
                                    value={agraharaApplied}
                                    onChange={(e) => setAgraharaApplied(e.target.checked)}
                                >
                                    <span className="text-orange-700">Agrahara Applied</span>
                                </Checkbox>
                            </Col>
                        </Row>
                        <Row className="ms-5 mt-5">
                            <Col span={21}>
                                <Tag color="blue" variant="outlined" className="w-full">
                                    <Row justify={"space-between"} className="px-5 py-3">
                                        <Col>
                                            <p className="text-gray-600">Total Amount</p>
                                            <p className="font-bold text-black text-2xl">
                                                Rs. {(selectedFramePrice + selectedLenseTypePrice + additionalPrice).toFixed(2)}
                                            </p>
                                        </Col>
                                        <Col>
                                            <p className="text-gray-600">Advance Payment</p>
                                            <p className="font-bold text-green-600 text-2xl">
                                                Rs. {advancePayment.toFixed(2)}
                                            </p>
                                        </Col>
                                        <Col>
                                            <p className="text-gray-600">Balance Due</p>
                                            <p className="font-bold text-red-600 text-2xl">
                                                Rs. {((selectedFramePrice + selectedLenseTypePrice + additionalPrice) - paidAmount).toFixed(2)}
                                            </p>
                                        </Col>
                                    </Row>
                                </Tag>
                            </Col>
                        </Row>
                    </Content>

                    <Content hidden={current !== 4} className="mt-10 flex flex-col gap-5">
                        <Alert
                            message="Order Details Verification"
                            description="Please verify all customer, prescription, spectacles, and payment details before completing the order."
                            type="info"
                            showIcon
                            className="mb-5"
                        />
                        <Row gutter={[16, 16]}>
                            {/* Customer Details */}
                            <Col span={12}>
                                <Card title="Customer Details">
                                    <Descriptions column={1} bordered size="small">
                                        <Descriptions.Item label="Customer ID">
                                            {selectedPatient?.id || "-"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Customer Name">
                                            {selectedPatient?.first_name} {selectedPatient?.last_name}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Project">
                                            {selectedProject || "-"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Clinic">
                                            {selectedClinic || "-"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* Prescription Details */}
                            <Col span={12}>
                                <Card title="Prescription Details">
                                    <Descriptions column={1} bordered size="small">
                                        <Descriptions.Item label="Prescription ID">
                                            {selectedPrescription?.node?.id || "-"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Created Date">
                                            {selectedPrescription?.node?.created_at
                                                ? new Date(selectedPrescription.node.created_at).toLocaleString()
                                                : "-"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* Spectacles Details */}
                            <Col span={24}>
                                <Row className="gap-3 w-full">
                                    <Col span={12}>
                                        <Card title="Spectacles Details">
                                            <Descriptions column={1} bordered size="small">
                                                <Descriptions.Item label="Frame Type">
                                                    {frameTypes.find(ft => ft.id === selectedFrameTypeId)?.type || "-"}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Frame">
                                                    {(() => {
                                                        const frame = frames.find(f => f.id === selectedFrameId);
                                                        return frame ? `Serial No: ${frame.serial_no} - ${frame.color}` : "-";
                                                    })()}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Lense Type">
                                                    {lenseTypes.find(lt => lt.id === selectedLenseTypeId)?.type || "-"}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </Col>

                                    {/* Payment Details */}
                                    <Col span={11}>
                                        <Card title="Payment Details">
                                            <Descriptions column={1} bordered size="small">
                                                <Descriptions.Item label="Frame Price">
                                                    <Tag color="blue">Rs. {selectedFramePrice.toFixed(2)}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Lense Price">
                                                    <Tag color="cyan">Rs. {selectedLenseTypePrice.toFixed(2)}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Additional Amount">
                                                    <Tag color="purple">Rs. {additionalPrice.toFixed(2)}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Advance Payment">
                                                    <Tag color="green">Rs. {advancePayment.toFixed(2)}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Paid Today">
                                                    <Tag color="gold">Rs. {paidAmount.toFixed(2)}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Balance Due">
                                                    <Tag color="red">
                                                        Rs. {(
                                                            (selectedFramePrice + selectedLenseTypePrice + additionalPrice) - paidAmount
                                                        ).toFixed(2)}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Agrahara Applied">
                                                    <Tag color="orange">{agraharaApplied ? "Yes" : "No"}</Tag>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Divider />

                        <p>Remarks</p>
                        <TextArea
                            rows={4}
                            placeholder="Additional note"
                            maxLength={6}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />

                        <Card>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <h2 className="text-xl font-bold">Final Total</h2>
                                </Col>
                                <Col>
                                    <Tag color="blue" className="text-lg px-5 py-2">
                                        Rs. {(selectedFramePrice + selectedLenseTypePrice + additionalPrice).toFixed(2)}
                                    </Tag>
                                </Col>
                            </Row>
                        </Card>
                    </Content>

                    <Row className="gap-3 ms-5 mt-5">
                        <Col span={24}>
                            {current > 0 && !isDisabled && (
                                <Button
                                    className="me-5"
                                    type="dashed"
                                    onClick={() => setCurrent(current - 1)}
                                >
                                    Previous
                                </Button>
                            )}
                            {current < 4 && !isDisabled && (
                                <Button
                                    disabled={isDisabled}
                                    type="primary"
                                    onClick={handleStepChange}
                                >
                                    Next
                                </Button>
                            )}
                            {current == 4 && !isDisabled && (
                                <Button
                                    disabled={isDisabled}
                                    type="primary"
                                    onClick={handleOrderSubmit}
                                >
                                    Complete Order
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Card>
            </div>
        </>
    );
}

export default NewOrder;