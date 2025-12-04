import React, { useState, useEffect } from "react";
import DashboardCard from "../common/DashboardCard";
import { salesReport } from "../../api/reports"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign, faStore, faChartLine, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { formatCurrency } from "../../utils/formatters";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from "recharts";
import "../../../src/styles/components/Dashboard.css";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

const Dashboard = () => {
  const [summary, setSummary] = useState({ today: {}, this_month: {} });
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesSummary();
  }, []);

const fetchSalesSummary = async () => {
  try {
    const { data } = await salesReport(); // ← NEW ENDPOINT

    console.log(data);
    

    const items = data.items; // all sales rows

    // Group by date
    const grouped = {};

    items.forEach(sale => {
      const dateKey = new Date(sale.created_at).toISOString().split("T")[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          revenue: 0,
          commission: 0,
          transactions: 0
        };
      }

      grouped[dateKey].revenue += Number(sale.revenue);
      grouped[dateKey].commission += Number(sale.commission);
      grouped[dateKey].transactions += 1;
    });

    const dailyArray = Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    setDailyData(
      dailyArray.map(d => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }),
        revenue: d.revenue,
        commission: d.commission,
        transactions: d.transactions
      }))
    );

    // Compute today + month summary
    const todayKey = new Date().toISOString().split("T")[0];

    const today = grouped[todayKey] || {
      revenue: 0,
      commission: 0,
      transactions: 0
    };

    const this_month = dailyArray.reduce(
      (acc, d) => {
        acc.revenue += d.revenue;
        acc.commission += d.commission;
        acc.transactions += d.transactions;
        return acc;
      },
      { revenue: 0, commission: 0, transactions: 0 }
    );

    setSummary({
      today,
      this_month
    });

  } catch (error) {
    console.error("Dashboard summary error:", error);
  } finally {
    setLoading(false);
  }
};


  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
      <DashboardCard
  title="Today's Revenue"
  value={summary.today.revenue}
  subtitle={`${summary.today.transactions} transactions`}
  icon={faDollarSign}
  color="#22c55e"
/>

<DashboardCard
  title="Today's Commission"
  value={summary.today.commission}
  subtitle="Hub earnings"
  icon={faStore}
  color="#3b82f6"
/>

<DashboardCard
  title="This Month Revenue"
  value={summary.this_month.revenue}
  subtitle={`${summary.this_month.transactions} transactions`}
  icon={faChartLine}
  color="#f59e0b"
/>

<DashboardCard
  title="This Month Commission"
  value={summary.this_month.commission}
  subtitle="Hub earnings"
  icon={faBriefcase}
  color="#ef4444"
/>

      </div>

      {/* Line Chart: Revenue & Commission over 30 days */}
      <div className="dashboard-chart">
        <h3>Revenue & Commission - Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} animationDuration={1500} />
            <Line type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} animationDuration={1500} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Chart: Revenue vs Commission */}
      <div className="dashboard-chart">
        <h3>Revenue vs Commission</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Revenue", value: summary.this_month.total_revenue || 0 },
                { name: "Commission", value: summary.this_month.total_commission || 0 }
              ]}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              label
              animationDuration={1500}
            >
              <Cell key="revenue" fill="#22c55e" />
              <Cell key="commission" fill="#3b82f6" />
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart: Daily Transactions */}
      <div className="dashboard-chart">
        <h3>Daily Transactions - Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="transactions" fill="#f59e0b" animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
