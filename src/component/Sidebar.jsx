import { Layout } from "antd";
import { EyeOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { Menu } from "antd";

import { useAuth } from "../const/functions";
import { MENU_BY_ROLE } from "../const/menu";

const { Sider } = Layout;

export default function Sidebar() {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = MENU_BY_ROLE[role] ?? [];

  return (
    <Sider
      width={260}
      className="ve-sidebar"
      // Prevent Ant from injecting its own inline background
      style={{ background: undefined }}
    >
      {/* ── Logo ── */}
      <div className="ve-sidebar-logo">
        <div className="ve-sidebar-logo-icon" aria-label="Vision Expert">
          <EyeOutlined style={{ fontSize: 24, color: "#ffffff" }} />
        </div>
        <div>
          <p className="ve-sidebar-logo-text">Vision Expert</p>
          <p className="ve-sidebar-logo-sub">Eye Care Management</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="ve-sidebar-menu-wrap">
        <Menu
          selectedKeys={[location.pathname]}
          mode="inline"
          theme="dark"
          items={items}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 14,
          }}
        />
      </div>

      {/* ── Logout ── */}
      <div className="ve-sidebar-logout">
        <div className="ve-sidebar-logout-btn" onClick={signOut} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && signOut()}>
          <LogoutOutlined style={{ fontSize: 16 }} />
          <span>Logout</span>
        </div>
      </div>
    </Sider>
  );
}
