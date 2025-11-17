import React, { useState, useEffect } from "react";
import DashboardCard from "../common/DashboardCard";
import { salesService } from "../../services/salesService";
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
      const response = await salesService.getSalesSummary();
      const rawData = response.data.summary; // Array of daily summaries
      console.log(response);
      

      // Extract today and this month summary
      const today = rawData.find(d => new Date(d.date).toDateString() === new Date().toDateString()) || {};
      const this_month = rawData.reduce((acc, d) => {
        acc.transaction_count = (acc.transaction_count || 0) + Number(d.transaction_count);
        acc.total_revenue = (acc.total_revenue || 0) + Number(d.total_revenue);
        acc.total_commission = (acc.total_commission || 0) + Number(d.total_commission);
        return acc;
      }, {});

      setSummary({ today, this_month });

      // Sort dailyData by date ascending
      const sortedData = rawData
        .map(d => ({
          date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: Number(d.total_revenue),
          commission: Number(d.total_commission),
          transactions: Number(d.transaction_count)
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setDailyData(sortedData);

    } catch (error) {
      console.error("Error fetching sales summary:", error);
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
          value={summary.today.total_revenue || 0}
          subtitle={`${summary.today.transaction_count || 0} transactions`}
          icon={faDollarSign}
          color="#22c55e"
        />
        <DashboardCard
          title="Today's Commission"
          value={summary.today.total_commission || 0}
          subtitle="Hub earnings"
          icon={faStore}
          color="#3b82f6"
        />
        <DashboardCard
          title="This Month Revenue"
          value={summary.this_month.total_revenue || 0}
          subtitle={`${summary.this_month.transaction_count || 0} transactions`}
          icon={faChartLine}
          color="#f59e0b"
        />
        <DashboardCard
          title="This Month Commission"
          value={summary.this_month.total_commission || 0}
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
