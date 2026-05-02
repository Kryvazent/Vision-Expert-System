import React from 'react'
import { Typography } from 'antd';
import DailyCollectionTable from '../../component/recoveryOfficer/DailyCollectionTable';

const { Title } = Typography;

function PendingPayment() {
  return (
    <div className=' bg-gray-100 p-10'>
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="!mb-0 !text-gray-900">
          Extra Recovery
        </Title>
      </div>
      <DailyCollectionTable/> 
      </div>
  )
}

export default PendingPayment