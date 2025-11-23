import React, { useEffect, useState } from "react";
import { expenseService } from "../../services/expenseService";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import "../../styles/components/expenses/ExpenseReport.css";

const ExpenseReport = ({ refreshFlag }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await expenseService.getExpenseSummary();

      if (response.data.success && Array.isArray(response.data.summary)) {
        // Convert total_amount to number for charts
        const numericSummary = response.data.summary.map(item => ({
          ...item,
          total_amount: Number(item.total_amount)
        }));
        setSummary(numericSummary);
      } else {
        setSummary([]);
      }
    } catch (error) {
      console.log("Summary error:", error);
      toast.error("Failed to load report");
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshFlag]); // re-fetch whenever refreshFlag changes

  if (loading) return <div className="report-loading">Loading report...</div>;
  if (!summary.length) return <div className="no-report">No expenses to generate report.</div>;

  const COLORS = ["#4d70ff", "#ff7676", "#ffb74d", "#66bb6a", "#9575cd", "#26c6da"];

  return (
    <div className="expense-report-container">
      <h2 className="report-title">Expense Report</h2>

      {/* Summary cards */}
      <div className="summary-card-wrapper">
        {summary.map((item, index) => (
          <div key={index} className="summary-card">
            <h3>{item.category}</h3>
            <p>₦{Number(item.total_amount).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="chart-section">
        {/* PIE CHART */}
        <div className="chart-card">
          <h3 className="chart-title">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summary}
                dataKey="total_amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {summary.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="chart-card">
          <h3 className="chart-title">Category Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_amount" fill="#4d70ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
