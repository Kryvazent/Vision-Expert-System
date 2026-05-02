import React from 'react'
import { Typography } from 'antd';
import { Progress, Card, Statistic } from "antd";
import { TrophyOutlined, DollarCircleOutlined, ShoppingOutlined, CheckCircleOutlined, RiseOutlined } from "@ant-design/icons";
 
const metrics = [
  {
    icon: <DollarCircleOutlined style={{ fontSize: 32, color: "#3b82f6" }} />,
    label: "Revenue Target",
    current: "LKR 3,850,000",
    target: "5,000,000",
    displayCurrent: "LKR 3,850,000 /\n5,000,000",
    percent: 77,
    remaining: "Remaining: LKR 1,150,000",
    color: "#3b82f6",
  },
  {
    icon: <ShoppingOutlined style={{ fontSize: 32, color: "#22c55e" }} />,
    label: "Orders Target",
    displayCurrent: "118 / 150",
    percent: 79,
    remaining: "Remaining: 32 orders",
    color: "#3b82f6",
  },
  {
    icon: <CheckCircleOutlined style={{ fontSize: 32, color: "#a855f7" }} />,
    label: "Deliveries Target",
    displayCurrent: "105 / 140",
    percent: 75,
    remaining: "Remaining: 35 deliveries",
    color: "#3b82f6",
  },
];

const { Title } = Typography;

function ManagerDashboard() {
  return (
    <div className=" bg-gray-100 p-10">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="!mb-0 !text-gray-900">
          Monthly Performance Overview
        </Title>
      </div>
 
      {/* Card Container */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full">
 
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-8">
          <TrophyOutlined style={{ fontSize: 24, color: "#f59e0b" }} />
          <h2 className="text-xl font-semibold text-gray-800 m-0">
            Monthly Performance - May 2026
          </h2>
        </div>
 
        <div className="grid grid-cols-3 gap-5 mb-8">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-5 bg-gray-100 rounded-xl border border-gray-200 w-full"
              style={{ minHeight: 200 }}
            >
              <div className="mb-3">{metric.icon}</div>
              <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
              <p className="text-base font-bold text-gray-800 mb-3 whitespace-pre-line leading-snug">
                {metric.displayCurrent}
              </p>
              <div className="w-full mb-2">
                <Progress
                  percent={metric.percent}
                  strokeColor={metric.color}
                  trailColor="#d1d5db"
                  size="small"
                  format={(p) => (
                    <span className="text-xs text-gray-600 font-medium">{p}%</span>
                  )}
                />
              </div>
              <p className="text-xs text-gray-400 m-0">{metric.remaining}</p>
            </div>
          ))}
        </div>
 
        {/* Overall Performance */}
        <div className="bg-blue-50 rounded-xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiseOutlined style={{ fontSize: 20, color: "#3b82f6" }} />
            <div>
              <p className="font-semibold text-gray-800 m-0">Overall Performance</p>
              <p className="text-sm text-gray-500 m-0">Average achievement across all targets</p>
            </div>
          </div>
          <span className="text-4xl font-bold text-blue-500">79%</span>
        </div>
      </div>
    </div>
  
  )
}

export default ManagerDashboard