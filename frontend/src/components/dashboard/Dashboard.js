import React, { useState, useEffect } from "react";
import StatCard from "../ui/StatCard";
import { salesReport, profitSummary, expenseSummary } from "../../api/reports"
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
  const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;
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
    fetchFinancialSummary();
    fetchSalesSummary();
     // eslint-disable-next-line 
  }, []);

const fetchSalesSummary = async () => {
  try {
    const { data } = await salesReport(); // ← NEW ENDPOINt
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
        value={formatCurrency(summary.today.revenue)}
        subtitle={`${summary.today.transactions} transactions`}
        icon={faSackDollar}
        color="success"
      />

        {isDemo ? (
          <>
            <StatCard
              title="Today's Commission"
              value={formatCurrency(summary.today.commission)}
              subtitle="Hub earnings"
              icon={faHandHoldingDollar}
              color="primary"
            />
          </>
        ):(
        <>
      <StatCard
        title="Today's Product Profit"
        value={formatCurrency(financialSummary.profit.today)}
        subtitle="Net Earnings"
        icon={faChartPie}
        color="success"
      />
        </>
        )}

        <StatCard
          title="Today's Expenses"
          value={formatCurrency(financialSummary.expense.today)}
          subtitle="Total Costs"
          icon={faReceipt}
          color="danger" // Red for expense
        />


        <StatCard
          title="This Month Revenue"
          value={formatCurrency(summary.this_month.revenue)}
          subtitle={`${summary.this_month.transactions} transactions`}
          icon={faArrowTrendUp}
          color="warning"
        />

        {isDemo ? (
          <>
            <StatCard
              title="This Month Commission"
              value={formatCurrency(summary.this_month.commission)}
              subtitle="Hub earnings"
              icon={faHandHoldingDollar}
              color="danger"
            /> 
          </>
        ):(
        <>
        <StatCard
          title="Month Product Profit"
          value={formatCurrency(financialSummary.profit.this_month)}
          subtitle="Net Earnings"
          icon={faCoins}
          color="success"
        />
        </>
        )}


        <StatCard
          title="This Month Expenses"
          value={formatCurrency(financialSummary.expense.this_month)}
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
                { name: "Revenue", value: round(summary.this_month.revenue) || 0 },
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
