/**
 * PageLayout — optional page-level header block (title / subtitle / action).
 *
 * CommonPageStructure already supplies the uniform outer padding via
 * .ve-content-wrap, so this component just adds the page header above the
 * children without nesting another padded container.
 *
 * Usage:
 *   <PageLayout title="Dashboard" subtitle="Overview of today's activity" extra={<Button>…</Button>}>
 *     {children}
 *   </PageLayout>
 *
 *   <PageLayout>    ← no header, children render directly
 *     {children}
 *   </PageLayout>
 */

import { Typography } from "antd";

const { Title, Text } = Typography;

export default function PageLayout({ title, subtitle, children, extra }) {
  return (
    <div>
      {(title || extra) && (
        <div className="ve-page-header">
          <div>
            {title && (
              <Title level={4} className="ve-page-title">
                {title}
              </Title>
            )}
            {subtitle && (
              <Text className="ve-page-subtitle">{subtitle}</Text>
            )}
          </div>
          {extra && <div className="ve-page-header-extra">{extra}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
