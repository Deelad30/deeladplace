import { Colors } from "chart.js";

const DashboardTiles = ({ summary }) => {
  const metrics = [
    { 
      title: 'Total Products', 
      value: Number(summary.total_products) || 0 ,
      color: "#d91f22"
    },
    { 
      title: 'Average Price', 
      value: summary.avg_vendor_price != null 
      ? `₦ ${Number(summary.avg_vendor_price).toFixed(2)}` 
      : '₦ 0.00',
      color: "#16A34A"
    },
    { 
      title: 'Average Commission', 
      value: summary.avg_commission != null 
  ? `₦ ${Number(summary.avg_commission).toFixed(2)}` 
  : '₦ 0.00', 
   color: "#4B5563"
    },
  ];

  return (
    <div className="dashboard-tiles">
      {metrics.map((m) => (
        <div key={m.title} style={{ backgroundColor: m.color }} className="tile">
          <h4>{m.title}</h4>
          <p>{m.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardTiles;
