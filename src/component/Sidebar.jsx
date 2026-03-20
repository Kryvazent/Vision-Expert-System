import React from "react";
import { Flex, Layout } from "antd";
import logo from "../assets/images/logo.jpeg";
import SideMenu from "./SideMenu"; 
import LogOut from "./LogOut";

const { Sider } = Layout;

const siderStyle = {
  textAlign: "center",
  lineHeight: "120px",
  color: "#fff",
  backgroundColor: "#092258",
  minHeight: "100vh",
};

function Sidebar(props) {
  return (
        <Sider width="280" style={siderStyle} className="flex flex-col">
          {/*Logo*/}
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center">
              <img
                src={props.logo}
                alt="Vision Expert Logo"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white">{props.title}</h3>
          </div>

          {/* Side Menu */}
          <div className="flex-1 px-3">
            <SideMenu menuItems={props.menuItems} />
          </div>

            {/* Logout */}
            <LogOut />

        </Sider>
  );
}


export default Sidebar;
