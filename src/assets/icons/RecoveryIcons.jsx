import React from "react";
import {
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const iconStyle = { color: "#3B82F6", fontSize: 22 };

export const icons = {
  shopping: <ShoppingOutlined style={iconStyle} />,
  dollar: <DollarOutlined style={iconStyle} />,
  user: <UserOutlined style={iconStyle} />,
  file: <FileTextOutlined style={iconStyle} />,
};

function RecoveryIcons() {
  return icons.shopping;
}

export default RecoveryIcons;
