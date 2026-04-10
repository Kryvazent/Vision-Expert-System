import React from "react";
import { Card } from "antd";
import { icons } from "../../assets/icons/RecoveryIcons";

function StatCard(props) {
  const selectedIcon = icons[props.iconType] || icons.shopping;

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedIcon}
          {props.title}
        </div>
      }
      style={{ width: 200 }}
    >
      <p>Card content</p>
    </Card>
  );
}

export default StatCard;
