import React from 'react'
import {Modal, Form, Input, InputNumber, Mentions, TimePicker, DatePicker, Button, Row, Col, Select } from 'antd';

const { Option} = Select;
const {TextArea} = Input;

export default function AddNewClinic({open, onClose, onSubmit}) {

const [ form ] = Form.useForm();

//submit form data (use onSubmit prop to pass data to parent component)
const handleFinish = (values) => {
  console.log(values);
  onSubmit && onSubmit(values);
  form.resetFields();
  onClose();
};

  return (

    <Modal title="Add New Clinic" open={open} onCancel={onClose} footer={null} centered width={700} >
    <Form layout="vertical" form = {form} onFinish={handleFinish} >

     <Form.Item  
      label="Select Project" name="project" rules={[{required: true, message: "Please select project"}]}
     >
      <Select placeholder="Please select project">
        <Option value="PRJ001">Vision Care Campaign System</Option>
        <Option value= "PRJ002">Free Eye Checkup - Kadawatha</Option>
      </Select>
      </Form.Item>

      {/*Date Time*/}
      <Row gutter={16}>
        <Col span={12}>
        <Form.Item label="Clinic Date" name="date"  rules={[{required:true , message: "Select Date"}]}>
          <DatePicker  style={{width:'100%'}} placeholder='Select Order'/>
        </Form.Item>
        </Col>

        <Col span={12}>
        <Form.Item label="Clinic time" name="time" rules={[{required:true , message: "Select time"}]}>
          <TimePicker.RangePicker style={{width:'100%'}} format="hh:mm A"/>
        </Form.Item>
        </Col>
      </Row>

        {/*Person + Role*/}
        <Row gutter={16}>
          <Col span={12}>
          <Form.Item label="Responsible person" name="person" rules={[{required:true, message: "Enter person name"}]} >
            <Input placeholder='Enter person name'/>
          </Form.Item>
          </Col>

          <Col span={12}>
          <Form.Item label="Role" name="role" rules={[{required:true, message:"Select role"}]}>
            <Select placeholder="Select role">
              <Option value= "Optometrist">Optometrist</Option>
              <Option value= "Sales Executive">Sales Executive</Option>
              <Option value= "Manager">Manger</Option>
            </Select>
          </Form.Item>  
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
          <Form.Item label="Branch" name="branch" initialValue="Kadawatha" rules={[{required: true}]}>
            <Select>
              <Option value="Kadawatha">Kadawatha</Option>
              <Option value="Mahiyanganaya">Mahiyanganaya</Option>
              <Option value="Kandy">Kandy</Option>
              <Option value="NuwaraEliya">NuwaraEliya</Option>
               <Option value="Dambulla">Dambulla</Option>
            </Select>
          </Form.Item>
          </Col>

          <Col span={12}>
          <Form.Item label="Status" name="status" initialValue="Scheduled" rules={[{required:true}]}>
            <Select>
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Planning">Planning</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
          <Form.Item label="Expected Customers" name="expected" rules={[{required:true}]}>
            <InputNumber style={{width: '100%'}} placeholder='Enter expected count' min={0} />
          </Form.Item>
          </Col>

          <Col span={12}>
          <Form.Item label="Actual Customers" name="actual" >
            <InputNumber style={{width: '100%'}} placeholder='Enter expected count' min={0} />
          </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Notes" name = "notes">
          <TextArea rows={3} placeholder='Enter any additional notes' />
        </Form.Item>

        {/*Footer -Add button*/}
        <Row justify="end" gutter={10}>
          <Col>
          <Button onClick={onClose}>Cancel</Button>
          </Col>
          <Col>
          <Button type='primary' htmlType='submit'>Add</Button>
          </Col>
        </Row>
    </Form>
    </Modal> 
  )

}