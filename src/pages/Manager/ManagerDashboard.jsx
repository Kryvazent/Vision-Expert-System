import React, { useMemo } from 'react';
import { Typography, Progress, Spin, Alert, Modal, Form, InputNumber, Button, message, Empty } from 'antd';
import {
  TrophyOutlined,
  DollarCircleOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const { Title, Text } = Typography;

// ------------------------------------------------------------------
// Targets Supabase's pg_graphql API.
//
// Revenue achievement is intentionally based on DELIVERED order value
// (order.total_price for orders whose delivery status is "Delivered"),
// not on raw payment rows. Payments can include advances/partials on
// orders that never end up delivered, which would inflate "achieved"
// revenue against a target that's meant to reflect completed business.
//
// Target writes go through the `setBranchTarget` SQL function (see
// migration below) instead of the generic updatebranchCollection
// mutation. That mutation's atMost:1 safety check is evaluated against
// filter + RLS together, and on multi-branch schemas an RLS USING
// clause that isn't tightly scoped can make the match set exceed 1
// row even though `id` is a primary key — producing "update impacts
// too many records". A dedicated function does a plain
// `UPDATE ... WHERE id = branch_id`, which can't fan out.
// ------------------------------------------------------------------

const GET_BRANCH_PERFORMANCE = gql`
  query GetBranchPerformance($branchId: Int!, $monthStart: Datetime!, $monthEnd: Datetime!) {
    branchCollection(filter: { id: { eq: $branchId } }) {
      edges {
        node {
          id
          revenue_target
          order_target
        }
      }
    }
    orderCollection(
      filter: {
        branch_id: { eq: $branchId }
        placed_at: { gte: $monthStart, lt: $monthEnd }
      }
    ) {
      edges {
        node {
          id
          total_price
          delivery_orderCollection {
            edges {
              node {
                status
              }
            }
          }
        }
      }
    }
  }
`;

const SET_BRANCH_TARGET = gql`
  mutation SetBranchTarget($branchId: Int!, $revenueTarget: Float!, $orderTarget: BigInt!) {
    setBranchTarget(
      branchId: $branchId
      revenueTarget: $revenueTarget
      orderTarget: $orderTarget
    ) {
      id
      revenue_target
      order_target
    }
  }
`;

function formatCurrency(n) {
  if (n === null || n === undefined) return 'LKR 0';
  return `LKR ${Number(n).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
}

// Antd InputNumber needs a matching parser whenever a formatter is used,
// or typed input can't be converted back to a number.
function formatRevenueInput(value) {
  if (value === undefined || value === null || value === '') return '';
  return `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function parseRevenueInput(value) {
  if (!value) return '';
  return value.replace(/LKR\s?|,/g, '');
}

function pct(achieved, target) {
  if (!target) return 0;
  return Math.round((achieved / target) * 100);
}

const DELIVERED_STATUS = 'Delivered';

// branchId: integer id from vision_expert.branch
function ManagerDashboard({ branchId }) {
  const [targetModalOpen, setTargetModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const now = dayjs();
  const monthStart = now.startOf('month');
  const monthEnd = monthStart.add(1, 'month');

  const { data, loading, error, refetch } = useQuery(GET_BRANCH_PERFORMANCE, {
    variables: {
      branchId,
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
    },
    skip: !branchId,
    fetchPolicy: 'network-only',
  });

  const branch = data?.branchCollection?.edges?.[0]?.node;
  const hasTarget = branch && branch.revenue_target !== null && branch.order_target !== null;

  // Aggregate raw records into the numbers the UI needs
  const performance = useMemo(() => {
    if (!branch || !data?.orderCollection) return null;

    const orders = data.orderCollection.edges.map((e) => e.node);
    const ordersAchieved = orders.length;

    let revenueAchieved = 0;
    let deliveriesAchieved = 0;

    orders.forEach((order) => {
      const isDelivered = order.delivery_orderCollection.edges.some(
        (dEdge) => dEdge.node.status === DELIVERED_STATUS
      );

      if (isDelivered) {
        deliveriesAchieved += 1;
        // Revenue counts only the value of orders that were actually
        // delivered this month — not arbitrary payment/advance rows.
        revenueAchieved += order.total_price || 0;
      }
    });

    return {
      revenue_target: branch.revenue_target,
      revenue_achieved: revenueAchieved,
      revenue_pct: pct(revenueAchieved, branch.revenue_target),
      order_target: branch.order_target,
      orders_achieved: ordersAchieved,
      order_pct: pct(ordersAchieved, branch.order_target),
      deliveries_achieved: deliveriesAchieved,
      total_orders: ordersAchieved,
      delivery_pct: pct(deliveriesAchieved, ordersAchieved),
    };
  }, [branch, data]);

  const overallPct = performance
    ? Math.round((performance.revenue_pct + performance.order_pct + performance.delivery_pct) / 3)
    : 0;

  const [setBranchTarget, { loading: savingTarget }] = useMutation(SET_BRANCH_TARGET, {
    onCompleted: (result) => {
      if (!result?.setBranchTarget?.id) {
        message.error('Branch target could not be saved.');
        return;
      }
      message.success('Monthly target saved');
      setTargetModalOpen(false);
      form.resetFields();
      refetch();
    },
    onError: (mutationError) => {
      message.error(`Failed to save target: ${mutationError.message}`);
    },
  });

  function handleSaveTarget(values) {
    setBranchTarget({
      variables: {
        branchId,
        revenueTarget: values.revenue_target,
        orderTarget: values.order_target,
      },
    });
  }

  const metrics = performance
    ? [
        {
          icon: <DollarCircleOutlined style={{ fontSize: 32, color: '#3b82f6' }} />,
          label: 'Revenue Target',
          displayCurrent: `${formatCurrency(performance.revenue_achieved)} /\n${formatCurrency(
            performance.revenue_target
          ).replace('LKR ', '')}`,
          percent: Math.min(performance.revenue_pct, 100),
          remaining: `Remaining: ${formatCurrency(
            Math.max(performance.revenue_target - performance.revenue_achieved, 0)
          )}`,
        },
        {
          icon: <ShoppingOutlined style={{ fontSize: 32, color: '#22c55e' }} />,
          label: 'Orders Target',
          displayCurrent: `${performance.orders_achieved} / ${performance.order_target}`,
          percent: Math.min(performance.order_pct, 100),
          remaining: `Remaining: ${Math.max(
            performance.order_target - performance.orders_achieved,
            0
          )} orders`,
        },
        {
          icon: <CheckCircleOutlined style={{ fontSize: 32, color: '#a855f7' }} />,
          label: 'Deliveries',
          displayCurrent: `${performance.deliveries_achieved} / ${performance.total_orders}`,
          percent: Math.min(performance.delivery_pct, 100),
          remaining: `Remaining: ${Math.max(
            performance.total_orders - performance.deliveries_achieved,
            0
          )} to deliver`,
        },
      ]
    : [];

  return (
    <div className="bg-gray-100 p-10">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <TrophyOutlined style={{ fontSize: 24, color: '#f59e0b' }} />
            <h2 className="text-xl font-semibold text-gray-800 m-0">
              Monthly Performance - {now.format('MMMM YYYY')}
            </h2>
          </div>
          <Button icon={<SettingOutlined />} onClick={() => setTargetModalOpen(true)}>
            {hasTarget ? 'Edit Target' : 'Set Target'}
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        )}

        {!loading && error && (
          <Alert
            type="error"
            message="Failed to load performance data"
            description={error.message}
            showIcon
          />
        )}

        {!loading && !error && !hasTarget && (
          <Empty description={`No target set for ${now.format('MMMM YYYY')} yet.`} className="py-12">
            <Button type="primary" onClick={() => setTargetModalOpen(true)}>
              Set Monthly Target
            </Button>
          </Empty>
        )}

        {!loading && !error && hasTarget && performance && (
          <>
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
                      strokeColor="#3b82f6"
                      trailColor="#d1d5db"
                      size="small"
                      format={(p) => <span className="text-xs text-gray-600 font-medium">{p}%</span>}
                    />
                  </div>
                  <p className="text-xs text-gray-400 m-0">{metric.remaining}</p>
                </div>
              ))}
            </div>

            {/* Overall Performance */}
            <div className="bg-blue-50 rounded-xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RiseOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
                <div>
                  <p className="font-semibold text-gray-800 m-0">Overall Performance</p>
                  <p className="text-sm text-gray-500 m-0">Average achievement across all targets</p>
                </div>
              </div>
              <span className="text-4xl font-bold text-blue-500">{Math.min(overallPct, 100)}%</span>
            </div>
          </>
        )}
      </div>

      {/* Set/Edit Target Modal */}
      <Modal
        title={`Set Target - ${now.format('MMMM YYYY')}`}
        open={targetModalOpen}
        onCancel={() => setTargetModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={savingTarget}
        okText="Save Target"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveTarget}
          initialValues={{
            revenue_target: branch?.revenue_target,
            order_target: branch?.order_target,
          }}
        >
          <Form.Item
            label="Revenue Target (LKR)"
            name="revenue_target"
            rules={[{ required: true, message: 'Revenue target is required' }]}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: '100%' }}
              formatter={formatRevenueInput}
              parser={parseRevenueInput}
            />
          </Form.Item>
          <Form.Item
            label="Orders Target"
            name="order_target"
            rules={[{ required: true, message: 'Orders target is required' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManagerDashboard;