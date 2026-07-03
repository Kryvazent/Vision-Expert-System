/**
 * StatCard — universal metric card used across every role's dashboards.
 *
 * Props:
 *   title        {string}          Label above the value
 *   value        {string|number}   Main metric to display
 *   subtitle     {string}          Small muted text below value (optional)
 *   icon         {ReactNode}       Ant Design icon element (optional)
 *   accent       {string}          Hex color for left border + icon badge (default: primary blue)
 *   loading      {boolean}         Show skeleton while data loads
 *
 * Visual:
 *   - White card with a 4 px colored left border
 *   - Icon badge (rounded square) in the top-right
 *   - Subtle hover lift
 */

import { Skeleton } from "antd";

const DEFAULT_ACCENT = "#1677ff";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = DEFAULT_ACCENT,
  loading = false,
}) {
  const wash = `${accent}18`; // ~10 % opacity tint for the icon badge background

  return (
    <div
      className="ve-stat-card"
      style={{ "--ve-accent": accent, "--ve-accent-wash": wash }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : (
        <>
          <div className="ve-stat-top">
            <div className="ve-stat-body">
              <span className="ve-stat-title">{title}</span>
              <span className="ve-stat-value">{value}</span>
              {subtitle && <span className="ve-stat-subtitle">{subtitle}</span>}
            </div>
            {icon && (
              <div className="ve-stat-icon" aria-hidden="true">
                {icon}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
