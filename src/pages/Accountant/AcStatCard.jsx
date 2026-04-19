import React from "react";
import { Card } from "antd";
import { icons } from "../../assets/icons/AccountantIcons";

function AcStatCard({ iconType = "shopping" , className = "" }) {
  const selectedIcon = icons[iconType] || icons.shopping;

  return (
    
  <div className={`flex items-center justify-center text-blue-500 ${className}`}  >
      {selectedIcon}
    </div>
        
    
      
    
      
  
  );
}

export default AcStatCard;


