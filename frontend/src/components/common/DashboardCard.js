import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatCurrency } from "../../utils/formatters";
import "../../../src/styles/components/DashboardCard.css";

const DashboardCard = ({ title, value, subtitle, icon, color = "#22c55e" }) => {
  return (
    <div className="dashboard-card" style={{ borderLeftColor: color }}>
      <div className="card-content">
        <div className="card-text">
          <h3>{title}</h3>
          <div className="value">{typeof value === "number" ? formatCurrency(value) : value}</div>
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </div>
        <div className="card-icon" style={{ backgroundColor: color }}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
