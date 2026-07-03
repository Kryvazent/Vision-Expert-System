import { Layout } from "antd";
import { useAuth } from "../const/functions";

const { Header } = Layout;

/** Formats a role_name like "sales-executive" → "Sales Executive" */
function formatRole(roleName = "") {
  return roleName
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Derive initials from first + last name */
function initials(first = "", last = "") {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function TopHeader() {
  const { staff } = useAuth();

  const roleLabel = formatRole(staff?.role?.role_name);
  const branchName = staff?.branch?.branch_name;
  const avatarInitials = initials(staff?.first_name, staff?.last_name);
  const fullName = [staff?.first_name, staff?.last_name].filter(Boolean).join(" ");

  return (
    <Header className="ve-header">
      {/* Left: role title + branch badge */}
      <div className="ve-header-left">
        <h1 className="ve-header-role">{roleLabel}</h1>
        {branchName && (
          <span className="ve-header-branch-tag">{branchName} Branch</span>
        )}
      </div>

      {/* Right: avatar + name */}
      <div className="ve-header-right">
        <div className="ve-header-avatar" aria-hidden="true">
          {avatarInitials}
        </div>
        {fullName && <span className="ve-header-name">{fullName}</span>}
      </div>
    </Header>
  );
}
