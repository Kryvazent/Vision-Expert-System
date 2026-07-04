import React, { useEffect, useState } from 'react'
import {
  Modal, Form, Input, Select, InputNumber, Button,
  Typography, Divider, Steps, Table, Space, message,
} from 'antd'
import { PlusOutlined, DeleteOutlined, BarcodeOutlined, AppstoreOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Step } = Steps

const normalizeFrameTypeName = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/bride/g, 'bridge')
    .replace(/frame/g, '')
    .replace(/[^a-z0-9]/g, '')

// A single editable frame-item row in the stock list
function FrameRow({ index, item, selectedFrameTypeName, onChange, onRemove }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr auto',
      gap: 8,
      alignItems: 'center',
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: 8,
      padding: '8px 10px',
      marginBottom: 8,
    }}>
      <Input
        placeholder="Serial No. e.g. SN-00123"
        value={item.serial_no}
        onChange={e => onChange(index, 'serial_no', e.target.value)}
        prefix={<BarcodeOutlined style={{ color: '#9CA3AF' }} />}
        style={{ borderRadius: 6 }}
      />
      <Input
        value={selectedFrameTypeName}
        disabled
        style={{ borderRadius: 6 }}
      />
      <Input
        placeholder="Color (optional)"
        value={item.color}
        onChange={e => onChange(index, 'color', e.target.value)}
        style={{ borderRadius: 6 }}
      />
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={() => onRemove(index)}
        disabled={index === 0}
      />
    </div>
  )
}

const emptyFrame = () => ({ serial_no: '', color: '' })

export default function AddStockModal({
  open,
  onCancel,
  onAdd,
  productTypeList = [],
  frameTypeList = [],
  brandList = [],
  categoryBrandMap = [],
}) {
  const [step, setStep] = useState(0)
  const [productForm] = Form.useForm()
  const [addingNewCategory, setAddingNewCategory] = useState(false)
  const selectedTypeId = Form.useWatch('productTypeId', productForm)
  const newCategoryName = Form.useWatch('newCategory', productForm)

  // Per-frame rows for step 2
  const [frames, setFrames] = useState([emptyFrame()])
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const selectedCategoryName =
    productTypeList.find(pt => String(pt.id) === String(selectedTypeId))?.type || newCategoryName || ''
  const isFrameCategory = /frame/i.test(selectedCategoryName)
  const selectedFrameType = React.useMemo(() => {
    if (!isFrameCategory) return null

    const normalizedCategory = normalizeFrameTypeName(selectedCategoryName)
    const matchedType = frameTypeList.find((ft) => {
      const normalizedType = normalizeFrameTypeName(ft.type)
      return (
        String(ft.type).toLowerCase() === String(selectedCategoryName).toLowerCase() ||
        normalizedType === normalizedCategory ||
        String(ft.id) === String(selectedTypeId)
      )
    })

    return matchedType || { id: selectedTypeId, type: selectedCategoryName }
  }, [frameTypeList, isFrameCategory, selectedCategoryName, selectedTypeId])

  const brandOptionsForCategory = React.useMemo(() => {
    if (!selectedTypeId) return brandList

    const mappedBrandIds = categoryBrandMap
      .filter((row) => String(row.productTypeId) === String(selectedTypeId))
      .map((row) => String(row.brandId))

    if (mappedBrandIds.length === 0) return brandList

    const filtered = brandList.filter((brand) => mappedBrandIds.includes(String(brand.id)))
    return filtered.length > 0 ? filtered : brandList
  }, [brandList, categoryBrandMap, selectedTypeId])

  React.useEffect(() => {
    const currentBrandId = productForm.getFieldValue('brandId')
    if (!currentBrandId) return

    const stillValid = brandOptionsForCategory.some((brand) => String(brand.id) === String(currentBrandId))
    if (!stillValid) {
      productForm.setFieldValue('brandId', undefined)
    }
  }, [brandOptionsForCategory, productForm, selectedCategoryName])

  // Reset everything when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(0)
      productForm.resetFields()
      setAddingNewCategory(false)
      setFrames([emptyFrame()])
      setQuantity(1)
      setSubmitting(false)
    }
  }, [open])

  // ── Step 1 → Step 2 ────────────────────────────────────────────────────────
  const handleNextStep = () => {
    productForm.validateFields().then(() => setStep(1))
  }

  // ── Frame row helpers ──────────────────────────────────────────────────────
  const handleFrameChange = (index, field, value) => {
    setFrames(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddRow = () => setFrames(prev => [...prev, emptyFrame()])

  const handleRemoveRow = (index) => {
    setFrames(prev => prev.filter((_, i) => i !== index))
  }

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isFrameCategory) {
      if (!selectedFrameType?.id) {
        message.error(`Frame type "${selectedCategoryName}" is not available.`)
        return
      }

      // Validate: every frame needs a serial_no. Frame type is fixed from the selected category.
      const invalid = frames.some(f => !f.serial_no.trim())
      if (invalid) {
        message.error('Every frame item needs a serial number.')
        return
      }
      const dupes = new Set()
      const hasDupes = frames.some(f => {
        if (dupes.has(f.serial_no.trim())) return true
        dupes.add(f.serial_no.trim())
        return false
      })
      if (hasDupes) {
        message.error('Duplicate serial numbers found. Each frame must be unique.')
        return
      }
    } else if (!quantity || Number(quantity) < 1) {
      message.error('Enter a valid quantity.')
      return
    }

    setSubmitting(true)
    try {
      const productValues = await productForm.validateFields()
      const framesToAdd = isFrameCategory
        ? frames.map(f => ({ ...f, frame_type_id: selectedFrameType.id }))
        : []

      await onAdd({
        product: productValues,
        frames: framesToAdd,
        quantity: isFrameCategory ? framesToAdd.length : Number(quantity),
        stockMode: isFrameCategory ? 'serialised' : 'quantity',
      })
    } catch (err) {
      // validation errors surface automatically
    } finally {
      setSubmitting(false)
    }
  }

  const stepItems = [
    { title: 'Product Details', icon: <AppstoreOutlined /> },
    { title: 'Stock Items', icon: <BarcodeOutlined /> },
  ]

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusOutlined style={{ color: '#1D4ED8' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Add New Stock to Central Warehouse</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={620}
      centered
      destroyOnClose
    >
      {/* Progress indicator */}
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 24 }}
        items={stepItems}
      />

      {/* ── STEP 1: Product catalog entry ─────────────────────────────────── */}
      <div style={{ display: step === 0 ? 'block' : 'none' }}>
        <Form form={productForm} layout="vertical">
          {/* SKU — full width, serves as the product identifier */}
          <Form.Item
            label={
              <span style={{ fontWeight: 500 }}>
                SKU <span style={{ color: '#DC2626' }}>*</span>
                <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 400, marginLeft: 4 }}>(unique catalog ID)</span>
              </span>
            }
            name="sku"
            rules={[
              { required: true, message: 'Please enter a SKU!' },
              { pattern: /^\S+$/, message: 'SKU must not contain spaces' },
            ]}
          >
            <Input placeholder="e.g., RB-AVI-001" style={{ borderRadius: 8 }} />
          </Form.Item>

          {/* Category + Brand */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Category <span style={{ color: '#DC2626' }}>*</span></span>}
              name="productTypeId"
              rules={[{ required: !addingNewCategory, message: 'Please select a category!' }]}
            >
              {!addingNewCategory ? (
                <Select
                  placeholder="Select category"
                  options={productTypeList.map(pt => ({ label: pt.type, value: pt.id }))}
                  style={{ borderRadius: 8 }}
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <div
                        style={{ padding: '8px 12px', cursor: 'pointer', color: '#1D4ED8', fontWeight: 500 }}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setAddingNewCategory(true)
                          productForm.setFieldValue('productTypeId', undefined)
                        }}
                      >
                        + Add new category
                      </div>
                    </>
                  )}
                />
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Form.Item name="newCategory" noStyle rules={[{ required: true, message: 'Enter category name!' }]}>
                    <Input placeholder="e.g., ReadingGlasses" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Button onClick={() => setAddingNewCategory(false)} style={{ borderRadius: 8 }}>Cancel</Button>
                </div>
              )}
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Brand <span style={{ color: '#DC2626' }}>*</span></span>}
              name="brandId"
              rules={[{ required: true, message: 'Please select brand!' }]}
            >
              <Select
                placeholder={selectedCategoryName ? 'Select brand for this category' : 'Select category first'}
                options={brandOptionsForCategory.map(b => ({ label: b.brand, value: b.id }))}
                disabled={!selectedCategoryName}
                style={{ borderRadius: 8 }}
                notFoundContent={selectedCategoryName ? 'No mapped brands found for this category' : 'Select a category first'}
              />
            </Form.Item>
          </div>

          {/* Prices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Purchase Price (Rs.) <span style={{ color: '#DC2626' }}>*</span></span>}
              name="purchasePrice"
              rules={[{ required: true, message: 'Please enter purchase price!' }]}
            >
              <InputNumber placeholder="Enter price" min={0} style={{ width: '100%', borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Selling Price (Rs.) <span style={{ color: '#DC2626' }}>*</span></span>}
              name="sellingPrice"
              rules={[{ required: true, message: 'Please enter selling price!' }]}
            >
              <InputNumber placeholder="e.g., 5000" min={0} style={{ width: '100%', borderRadius: 8 }} />
            </Form.Item>
          </div>

          {/* Warranty */}
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>Warranty (Months)</span>}
            name="warrantyMonths"
            style={{ maxWidth: '50%' }}
          >
            <InputNumber placeholder="0 if none" min={0} style={{ width: '100%', borderRadius: 8 }} />
          </Form.Item>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleNextStep}
              style={{ background: '#1D4ED8', borderColor: '#1D4ED8', borderRadius: 8 }}
            >
              Next: Add Stock Items →
            </Button>
          </div>
        </Form>
      </div>

      {/* ── STEP 2: Individual frame/stock items ──────────────────────────── */}
      <div style={{ display: step === 1 ? 'block' : 'none' }}>
        <div>
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
          }}>
            <Text strong style={{ color: '#1E40AF', fontSize: 13 }}>
              {isFrameCategory ? 'Add individual serialised items' : 'Add quantity-based stock'}
            </Text>
            <br />
            <Text style={{ color: '#3B82F6', fontSize: 12 }}>
              {isFrameCategory
                ? 'Each row is one physical unit with its own unique serial number. Add as many as arrived in this batch.'
                : 'Enter the total quantity for this product. A single stock record will be created for the selected category.'}
            </Text>
          </div>

          {isFrameCategory ? (
            <>
              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr auto',
                gap: 8,
                padding: '0 10px',
                marginBottom: 4,
              }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Serial No. <span style={{ color: '#DC2626' }}>*</span>
                </Text>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Frame Type
                </Text>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Color
                </Text>
                <span />
              </div>

              {/* Frame rows */}
              <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                {frames.map((item, index) => (
                  <FrameRow
                    key={index}
                    index={index}
                    item={item}
                    selectedFrameTypeName={selectedFrameType?.type || selectedCategoryName}
                    onChange={handleFrameChange}
                    onRemove={handleRemoveRow}
                  />
                ))}
              </div>

              <Button
                icon={<PlusOutlined />}
                onClick={handleAddRow}
                style={{ marginTop: 8, borderRadius: 8, borderStyle: 'dashed', width: '100%' }}
              >
                Add another item
              </Button>
            </>
          ) : (
            <div style={{ maxWidth: 240 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
                Quantity to add
              </Text>
              <InputNumber
                min={1}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={() => setStep(0)} style={{ borderRadius: 8 }}>
              ← Back
            </Button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {isFrameCategory ? `${frames.length} item${frames.length !== 1 ? 's' : ''} to add` : `${quantity} unit${Number(quantity) !== 1 ? 's' : ''} to add`}
              </Text>
              <Button onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                style={{ background: '#1D4ED8', borderColor: '#1D4ED8', borderRadius: 8, fontWeight: 500 }}
              >
                Add {isFrameCategory ? `${frames.length} Stock Item${frames.length !== 1 ? 's' : ''}` : 'Stock Quantity'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
