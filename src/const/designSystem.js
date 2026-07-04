// Design System Constants for Vision Expert System
// Centralized design tokens for consistent UI across all roles and pages

// Color Palette
export const colors = {
  // Primary Colors
  primary: '#1890ff',
  primaryHover: '#40a9ff',
  primaryActive: '#096dd9',
  
  // Secondary Colors
  secondary: '#722ed1',
  secondaryHover: '#9254de',
  secondaryActive: '#531dab',
  
  // Success Colors
  success: '#52c41a',
  successHover: '#73d13d',
  successActive: '#389e0d',
  
  // Warning Colors
  warning: '#faad14',
  warningHover: '#ffc53d',
  warningActive: '#d48806',
  
  // Error Colors
  error: '#ff4d4f',
  errorHover: '#ff7875',
  errorActive: '#cf1322',
  
  // Neutral Colors
  textPrimary: '#262626',
  textSecondary: '#8c8c8c',
  textDisabled: '#bfbfbf',
  
  // Background Colors
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f7fa',
  bgTertiary: '#fafafa',
  bgHover: '#f0f0f0',
  
  // Border Colors
  borderColor: '#d9d9d9',
  borderColorLight: '#e8e8e8',
  borderColorDark: '#bfbfbf',
  
  // Role-specific Colors
  owner: '#1890ff',
  admin: '#52c41a',
  accountant: '#722ed1',
  salesExecutive: '#faad14',
  recoveryOfficer: '#ff4d4f',
  manager: '#13c2c2',
  optometrist: '#eb2f96',
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Typography
export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Button Styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: '#ffffff',
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.md,
    padding: '6px 16px',
    height: 36,
  },
  secondary: {
    backgroundColor: colors.bgSecondary,
    borderColor: colors.primary,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.md,
    padding: '6px 16px',
    height: 36,
  },
  danger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    color: '#ffffff',
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.md,
    padding: '6px 16px',
    height: 36,
  },
  default: {
    backgroundColor: colors.bgPrimary,
    borderColor: colors.borderColor,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.normal,
    borderRadius: borderRadius.md,
    padding: '6px 16px',
    height: 36,
  },
};

// Card Styles
export const cardStyles = {
  default: {
    backgroundColor: colors.bgPrimary,
    borderColor: colors.borderColorLight,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
  },
  compact: {
    backgroundColor: colors.bgPrimary,
    borderColor: colors.borderColorLight,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  elevated: {
    backgroundColor: colors.bgPrimary,
    borderColor: colors.borderColorLight,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
};

// Table Styles
export const tableStyles = {
  default: {
    size: 'middle',
    pagination: { pageSize: 10 },
    bordered: true,
    rowKey: 'id',
  },
  compact: {
    size: 'small',
    pagination: { pageSize: 15 },
    bordered: false,
    rowKey: 'id',
  },
};

// Form Styles
export const formStyles = {
  label: {
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    display: 'block',
    color: colors.textPrimary,
  },
  input: {
    height: 40,
    borderRadius: borderRadius.md,
  },
  select: {
    height: 40,
    borderRadius: borderRadius.md,
  },
  datePicker: {
    height: 40,
    borderRadius: borderRadius.md,
    width: '100%',
  },
};

// Modal Styles
export const modalStyles = {
  default: {
    centered: true,
    width: 600,
    bodyStyle: { padding: spacing.xxl },
  },
  large: {
    centered: true,
    width: 800,
    bodyStyle: { padding: spacing.xxl },
  },
  small: {
    centered: true,
    width: 400,
    bodyStyle: { padding: spacing.xl },
  },
};

// Header Styles
export const headerStyles = {
  container: {
    background: colors.bgSecondary,
    padding: `${spacing.xl}px ${spacing.xxxl}px`,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
  },
};

// Stat Card Styles
export const statCardStyles = {
  valueStyle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  titleStyle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
};

// Tag Colors for Status
export const statusColors = {
  pending: 'default',
  inProgress: 'processing',
  resolved: 'success',
  closed: 'default',
  active: 'success',
  inactive: 'error',
  hold: 'warning',
  cancelled: 'error',
  confirmed: 'blue',
  inLab: 'purple',
  readyForDelivery: 'cyan',
  delivered: 'success',
  finalDelivered: 'success',
};

// Export default design system object
export default {
  colors,
  spacing,
  borderRadius,
  typography,
  buttonStyles,
  cardStyles,
  tableStyles,
  formStyles,
  modalStyles,
  headerStyles,
  statCardStyles,
  statusColors,
};
