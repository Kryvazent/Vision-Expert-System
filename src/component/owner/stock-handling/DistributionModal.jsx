import React, { useEffect, useState } from 'react'
import { Modal, Form, Select, InputNumber, Input, Button, Typography, Tag, Divider } from 'antd'
import { SendOutlined, WarningOutlined, BarcodeOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'

const { Text } = Typography
const { TextArea } = Input

// Load in-stock frames for the product being distributed
const LOAD_IN_STOCK_FRAMES = gql`
  query LoadInStockFrames($product_id: BigInt!, $branch_id: Int!) {
    frameCollection(
      filter: {
        product_id: { eq: $product_id }
        branch_id:  { eq: $branch_id }
        status:     { eq: "in_stock" }
      }
      orderBy: [{ serial_no: AscNullsLast }]
    ) {
      edges {
        node {
          id
          serial_no
          color
          frame_type { type }
        }
      }
    }
  }
`

export default function DistributionModal({ open, product, branches = [], onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const [frameMode, setFrameMode] = useState('quantity') // 'quantity' | 'frame'
  const [availableFrames, setAvailableFrames] = useState([])

  const [loadFrames, { loading: framesLoading }] = useLazyQuery(LOAD_IN_STOCK_FRAMES, {
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (open) {
      form.resetFields()
      setFrameMode('quantity')
      setAvailableFrames([])
    }
  }, [open])

  // When a frame-level product is selected, load its in-stock frames
  useEffect(() => {
    if (open && product?.productId) {
      loadFrames({
        variables: { product_id: product.productId, branch_id: product.branchRawId },
      }).then(res => {
        const frames = res.data?.frameCollection?.edges.map(e => ({
          id: e.node.id,
          serial_no: e.node.serial_no,
          color: e.node.color,
          frame_type: e.node.frame_type?.type,
        })) || []
        setAvailableFrames(frames)
        // Auto-switch to frame mode if frames exist
        if (frames.length > 0) setFrameMode('frame')
      })
    }
  }, [open, product?.productId])

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({ ...values, frameMode, selectedFrameIds: values.selectedFrameIds || [] })
      form.resetFields()
    })
  }

  const selectedFrameCount = Form.useWatch('selectedFrameIds', form)?.length ?? 0

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SendOutlined style={{ color: '#1D4ED8' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Distribute Stock to Branch</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={540}
      centered
    >
      {/* Approval warning */}
      <div style={{
        background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
        padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10,
      }}>
        <WarningOutlined style={{ color: '#D97706', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
        <div>
          <Text strong style={{ color: '#92400E', fontSize: 13 }}>Manager Approval Required</Text>
          <br />
          <Text style={{ color: '#B45309', fontSize: 12 }}>
            This request will be sent to the branch manager for approval before stock is transferred.
          </Text>
        </div>
      </div>

      {/* Product info card */}
      {product && (
        <div style={{
          background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
          padding: '12px 16px', marginBottom: 20,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px',
        }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>SKU</Text>
            <br />
            <Text strong style={{ fontFamily: 'monospace', color: '#374151' }}>
              {product.sku || product.productCode}
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Category</Text>
            <br />
            <span style={{
              background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
              borderRadius: 6, padding: '1px 8px', fontSize: 12, fontWeight: 500,
            }}>{product.category}</span>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>In Stock</Text>
            <br />
            <span style={{
              background: '#059669', color: '#fff', borderRadius: 8,
              padding: '2px 10px', fontWeight: 700, fontSize: 13,
            }}>{product.stockQuantity ?? 0} units</span>
          </div>
          {availableFrames.length > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Serialised frames
              </Text>
              <br />
              <Text strong style={{ color: '#1D4ED8' }}>{availableFrames.length} available</Text>
            </div>
          )}
        </div>
      )}

      <Form form={form} layout="vertical">
        {/* Mode selector when frames are available */}
        {availableFrames.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['frame', 'quantity'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setFrameMode(m); form.resetFields(['selectedFrameIds', 'quantity']) }}
                  style={{
                    padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500,
                    border: frameMode === m ? '2px solid #1D4ED8' : '1px solid #D1D5DB',
                    background: frameMode === m ? '#EFF6FF' : '#fff',
                    color: frameMode === m ? '#1D4ED8' : '#374151',
                    fontSize: 13,
                  }}
                >
                  {m === 'frame' ? '🔖 Select specific frames' : '📦 Quantity only'}
                </button>
              ))}
            </div>
            <Divider style={{ margin: '0 0 16px' }} />
          </>
        )}

        {/* Frame serial selection */}
        {frameMode === 'frame' && availableFrames.length > 0 && (
          <Form.Item
            label={
              <span style={{ fontWeight: 500 }}>
                Select Frames <span style={{ color: '#DC2626' }}>*</span>
                <span style={{ color: '#6B7280', fontSize: 11, marginLeft: 6 }}>
                  ({availableFrames.length} in stock)
                </span>
              </span>
            }
            name="selectedFrameIds"
            rules={[{ required: true, message: 'Select at least one frame.' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select frame serial numbers…"
              loading={framesLoading}
              optionFilterProp="label"
              options={availableFrames.map(f => ({
                label: `${f.serial_no}${f.color ? ` · ${f.color}` : ''}${f.frame_type ? ` (${f.frame_type})` : ''}`,
                value: f.id,
              }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>Destination Branch <span style={{ color: '#DC2626' }}>*</span></span>}
            name="branch"
            rules={[{ required: true, message: 'Please select a branch!' }]}
          >
            <Select
              placeholder="Select branch"
              options={branches.map(b => ({ label: b.branch_name, value: b.id }))}
            />
          </Form.Item>

          {/* Quantity field shown only in quantity mode */}
          {frameMode === 'quantity' && (
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Quantity <span style={{ color: '#DC2626' }}>*</span></span>}
              name="quantity"
              rules={[
                { required: true, message: 'Please enter quantity!' },
                { type: 'number', min: 1, message: 'Must be at least 1' },
                {
                  validator: (_, value) => {
                    if (value && product && value > (product.stockQuantity ?? 0)) {
                      return Promise.reject(`Exceeds available stock (${product.stockQuantity})`)
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter quantity"
                style={{ width: '100%' }}
                min={1}
                max={product?.stockQuantity ?? undefined}
              />
            </Form.Item>
          )}

          {/* Show count badge when in frame mode */}
          {frameMode === 'frame' && (
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
              <div style={{
                background: selectedFrameCount > 0 ? '#EFF6FF' : '#F3F4F6',
                border: `1px solid ${selectedFrameCount > 0 ? '#BFDBFE' : '#D1D5DB'}`,
                borderRadius: 8, padding: '8px 14px', textAlign: 'center', width: '100%',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: selectedFrameCount > 0 ? '#1D4ED8' : '#9CA3AF' }}>
                  {selectedFrameCount}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>frames selected</div>
              </div>
            </div>
          )}
        </div>

        <Form.Item label={<span style={{ fontWeight: 500 }}>Notes (Optional)</span>} name="notes">
          <TextArea
            rows={3}
            placeholder="Add any notes or reasons for this distribution request"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
      </Form>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</Button>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          style={{ background: '#1D4ED8', borderColor: '#1D4ED8', borderRadius: 8, fontWeight: 500 }}
        >
          {frameMode === 'frame' && selectedFrameCount > 0
            ? `Submit ${selectedFrameCount} Frame${selectedFrameCount > 1 ? 's' : ''}`
            : 'Submit for Approval'}
        </Button>
      </div>
    </Modal>
  )
}
