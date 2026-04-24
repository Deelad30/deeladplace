import React, { useState, useEffect } from "react";
import StatCard from "../ui/StatCard";
import { profitSummary, expenseSummary } from "../../api/reports"
import { salesService } from "../../services/salesService";
import { faSackDollar,faHandHoldingDollar, faChartPie, faReceipt, faArrowTrendUp, faCoins, faFileInvoiceDollar 
} from "@fortawesome/free-solid-svg-icons";
import { formatCurrency } from "../../utils/formatters";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from "recharts";
import "../../../src/styles/components/Dashboard.css";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

const Dashboard = () => {
  const round = (num, nearest = 1) => Math.round(num / nearest) * nearest;
  const [summary, setSummary] = useState({ today: {}, this_month: {} });
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState({
  profit: { today: 0, this_month: 0 },
  expense: { today: 0, this_month: 0 }
});

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isDemo = user.plan === "demo"

// Fetch function
const fetchFinancialSummary = async () => {
  try {
    const [profitRes, expenseRes] = await Promise.all([
      profitSummary(),
      expenseSummary()
    ]);

    setFinancialSummary({
      profit: profitRes.data.profit,
      expense: expenseRes.data.expense
    });
  } catch (err) {
    console.error('Financial summary error:', err);
  }
};

  useEffect(() => {
    fetchSalesSummary();
     // eslint-disable-next-line 
  }, []);

const fetchSalesSummary = async () => {
  try {
    const now = new Date();
    // Nigeria-centric dates
    const todayStr = now.toISOString().split('T')[0];
    const monthStartStr = todayStr.substring(0, 8) + '01';
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch summaries and chart data in parallel
    const [todayRes, monthRes, summaryRes, profitRes, expenseRes, todayProfitRes, todayExpenseRes] = await Promise.all([
      salesService.getOverview({ start: todayStr, end: todayStr }),
      salesService.getOverview({ start: monthStartStr, end: todayStr }),
      salesService.getSalesSummary({ start: thirtyDaysAgoStr, end: todayStr }),
      profitSummary({ start: monthStartStr, end: todayStr }),
      expenseSummary({ start: monthStartStr, end: todayStr }),
      profitSummary({ start: todayStr, end: todayStr }),
      expenseSummary({ start: todayStr, end: todayStr })
    ]);

    setSummary({
      today: todayRes.overview ? {
        revenue: todayRes.overview.total_revenue,
        commission: todayRes.overview.total_commission,
        transactions: todayRes.overview.total_transactions
      } : {},
      this_month: monthRes.overview ? {
        revenue: monthRes.overview.total_revenue,
        commission: monthRes.overview.total_commission,
        transactions: monthRes.overview.total_transactions
      } : {}
    });

    // Chart data from backend summary
    if (summaryRes.summary) {
      setDailyData(
        summaryRes.summary.map(d => ({
          date: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          }),
          revenue: Number(d.total_revenue),
          commission: Number(d.total_commission),
          transactions: Number(d.total_transactions)
        }))
      );
    }

    setFinancialSummary({
      profit: {
        today: todayProfitRes.profit?.total || 0,
        this_month: profitRes.profit?.total || 0
      },
      expense: {
        today: todayExpenseRes.expense?.total || 0,
        this_month: expenseRes.expense?.total || 0
      }
    });

  } catch (error) {
    console.error("Dashboard summary error:", error);
  } finally {
    setLoading(false);
  }
};

const SkeletonCard = () => (
  <div className="dashboard-card skeleton">
    <div className="skeleton-icon" />
    <div className="skeleton-content">
      <div className="skeleton-line short" />
      <div className="skeleton-line long" />
    </div>
  </div>
);


  return (

    
    <div className="dashboard">

      <div className="dashboard-grid">
  {loading ? (
    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
  ) : (
    <>
      
      <div className="dashboard-grid">
      <StatCard
        title="Today's Revenue"
        value={formatCurrency(summary.today.revenue, true)}
        subtitle={`${summary.today.transactions} transactions`}
        icon={faSackDollar}
        color="success"
      />

        {isDemo ? (
          <>
            <StatCard
              title="Today's Commission"
              value={formatCurrency(summary.today.commission, true)}
              subtitle="Hub earnings"
              icon={faHandHoldingDollar}
              color="primary"
            />
          </>
        ):(
        <>
      <StatCard
        title="Today's Product Profit"
        value={formatCurrency(round(financialSummary.profit.today), true)}
        subtitle="Net Earnings"
        icon={faChartPie}
        color="success"
      />
        </>
        )}

        <StatCard
          title="Today's Expenses"
          value={formatCurrency(financialSummary.expense.today, true)}
          subtitle="Total Costs"
          icon={faReceipt}
          color="danger" // Red for expense
        />


        <StatCard
          title="This Month Revenue"
          value={formatCurrency(summary.this_month.revenue, true)}
          subtitle={`${summary.this_month.transactions} transactions`}
          icon={faArrowTrendUp}
          color="warning"
        />

        {isDemo ? (
          <>
            <StatCard
              title="This Month Commission"
              value={formatCurrency(summary.this_month.commission, true)}
              subtitle="Hub earnings"
              icon={faHandHoldingDollar}
              color="danger"
            /> 
          </>
        ):(
        <>
        <StatCard
          title="Month Product Profit"
          value={formatCurrency(round(financialSummary.profit.this_month), true)}
          subtitle="Net Earnings"
          icon={faCoins}
          color="success"
        />
        </>
        )}


        <StatCard
          title="This Month Expenses"
          value={formatCurrency(financialSummary.expense.this_month, true)}
          subtitle="Total Costs"
          icon={faFileInvoiceDollar}
          color="danger"
        />

      </div>
    </>
  )}
</div>

      {/* Line Chart: Revenue & Commission over 30 days */}
      <div className="dashboard-chart">
        <h3>Revenue & Commission - Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(value, true)} />
            <Line type="monotone" dataKey="revenue" name="Total Revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} animationDuration={1500} />
            <Line type="monotone" dataKey="commission" name="Commission" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} animationDuration={1500} />
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
                { name: "Net Sales", value: round(summary.this_month.revenue - summary.this_month.commission) || 0 },
                { name: "Commission", value: round(summary.this_month.commission) || 0 }
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
