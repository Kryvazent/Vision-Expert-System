import React from 'react'
import { Card, Typography } from 'antd'

const { Text } = Typography

const StatCard = ({ label, value, color, bg, icon, alert }) => {
  return (
    <Card
      style={{
        borderRadius: 12,
        border:  '1px solid #E5E7EB',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        background: bg || '#fff',
      }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <div>
          <Text
          type="secondary"
          style={{
          fontSize: '14px',
           color: '#8c8c8c', marginBottom: '8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
  }}
>
  {label}
</Text>

          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: color || '#1f1f1f',
              marginTop: 4,
            }}
          >
            {value}
          </div>
        </div>

        {icon && (
          <div style={{ fontSize: '24px', color , }}>
            {icon}
          </div>
        )}

      </div>
    </Card>
  )
}

export default StatCard
