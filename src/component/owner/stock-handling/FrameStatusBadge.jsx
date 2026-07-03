import React from 'react'

const STATUS_CONFIG = {
  in_stock: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    text: '#065F46',
    dot: '#16A34A',
    label: 'In Stock',
  },
  reserved: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
    dot: '#D97706',
    label: 'Reserved',
  },
  sold: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1E40AF',
    dot: '#2563EB',
    label: 'Sold',
  },
  damaged: {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
    dot: '#DC2626',
    label: 'Damaged',
  },
  transferred: {
    bg: '#F5F3FF',
    border: '#DDD6FE',
    text: '#5B21B6',
    dot: '#7C3AED',
    label: 'Transferred',
  },
}

/**
 * FrameStatusBadge — pill badge for frame.status values.
 *
 * Props:
 *   status  — one of 'in_stock' | 'reserved' | 'sold' | 'damaged' | 'transferred'
 *   size    — 'small' | 'default' (default: 'default')
 */
export default function FrameStatusBadge({ status, size = 'default' }) {
  const cfg = STATUS_CONFIG[status] || {
    bg: '#F3F4F6',
    border: '#D1D5DB',
    text: '#374151',
    dot: '#6B7280',
    label: status ?? '—',
  }

  const isSmall = size === 'small'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 4 : 6,
        padding: isSmall ? '2px 8px' : '3px 10px',
        borderRadius: 20,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        fontSize: isSmall ? 11 : 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSmall ? 6 : 7,
          height: isSmall ? 6 : 7,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  )
}
