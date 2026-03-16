import React from "react";
import { Flex, Layout } from "antd";
import logo from "../assets/images/logo.jpeg";
import SideMenu from "./SideMenu"; // Import the SideMenu component
import TopHeader from "./TopHeader";
import LogOut from "./LogOut";

const { Sider } = Layout;

const siderStyle = {
  textAlign: "center",
  lineHeight: "120px",
  color: "#fff",
  backgroundColor: "#2563EB",
  minHeight: "100vh",
};

const layoutStyle = {
  overflow: "hidden",
  width: "100%",
  maxWidth: "100%",
};

function Sidebar() {
  return (
  <Layout className="min-h-screen" style={layoutStyle}>
        <Sider width="280" style={siderStyle} className="flex flex-col">
          {/*Logo*/}
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center">
              <img
                src={logo}
                alt="Vision Expert Logo"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white">Vision Expert</h3>
          </div>

          {/* Side Menu */}
          <div className="flex-1 px-3">
            <SideMenu />
          </div>

            {/* Logout */}
            <LogOut />

        </Sider>

        {/* {Top Header} */}
        <TopHeader />
      </Layout>
  );
}

export default Sidebar;
