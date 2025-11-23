import React, { useEffect, useState } from "react";
import { expenseService } from "../../services/expenseService";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import "../../styles/components/expenses/ExpenseReport.css";

const ExpenseReport = ({ refreshFlag }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseService.getAllExpenses();
      if (response.data.success) {
        const numericExpenses = response.data.expenses.map(item => ({
          ...item,
          amount: Number(item.amount),
          expense_date: item.expense_date
        }));
        setExpenses(numericExpenses);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.log("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [refreshFlag]);

  const filteredExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.expense_date);
    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

    return (
      (!categoryFilter || exp.category === categoryFilter) &&
      (!fromDate || expDate >= fromDate) &&
      (!toDate || expDate <= toDate)
    );
  });

  // Aggregate totals by category
  const summary = filteredExpenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.category === exp.category);
    if (existing) {
      existing.total_amount += exp.amount;
    } else {
      acc.push({ category: exp.category, total_amount: exp.amount });
    }
    return acc;
  }, []);

  // Total of all filtered expenses
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Find the largest category for highlighting
  const maxAmount = Math.max(...summary.map(item => item.total_amount), 0);

  if (loading) return <div className="report-loading">Loading report...</div>;
  if (!summary.length) return <div className="no-report">No expenses to generate report.</div>;

  const COLORS = ["#4d70ff", "#ff7676", "#ffb74d", "#66bb6a", "#9575cd", "#26c6da"];

  return (
    <div className="expense-report-container">
      <h2 className="report-title">Expense Report</h2>

      {/* Filters */}
      <div className="expense-filters">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Fuel">Fuel</option>
          <option value="Supplies">Supplies</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Utilities">Utilities</option>
          <option value="Misc">Misc</option>
        </select>

        <input
          type="date"
          value={dateFilter.from}
          onChange={e => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
        />
        <input
          type="date"
          value={dateFilter.to}
          onChange={e => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
        />
      </div>

      {/* Total Expenses */}
      <div className="total-expenses">
        <h3>Total Expenses: ₦{totalExpenses.toLocaleString()}</h3>
      </div>

      {/* Summary cards */}
      <div className="summary-card-wrapper">
        {summary.map((item, index) => (
          <div
            key={index}
            className="summary-card"
            style={{
              border:
                item.total_amount === maxAmount ? "2px solid #ff7676" : "1px solid #ccc"
            }}
          >
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
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    stroke={entry.total_amount === maxAmount ? "#ff7676" : ""}
                    strokeWidth={entry.total_amount === maxAmount ? 4 : 0}
                  />
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
              <Bar
                dataKey="total_amount"
                fill="#4d70ff"
                radius={[6, 6, 0, 0]}
                label={{ position: "top" }}
              >
                {summary.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.total_amount === maxAmount ? "#ff7676" : "#4d70ff"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
