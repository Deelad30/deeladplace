import React, { useEffect, useState } from "react"; 
import { expenseService } from "../../services/expenseService";
import toast from "react-hot-toast";
import { vendorService } from "../../services/vendorService";
import "../../styles/components/expenses/ExpenseList.css";
import ConfirmationModal from "../common/ConfirmationModal";

const ExpenseList = ({ refreshFlag, onEditExpense }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [expenses, setExpenses] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchExpenses = async () => {
    try {
      const response = await expenseService.getAllExpenses();
      if (response.data.success) {
        setExpenses(response.data.expenses);
      }
    } catch (error) {
      toast.error("Failed to load expenses");
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadVendors = async () => {
    try {
      const res = await vendorService.getAllVendors();
      if (res.data.success) {
        setVendors(res.data.vendors);
      }
    } catch (error) {
      toast.error("Failed to load vendors");
      console.error("Vendor fetch error:", error);
    }
  };

  loadVendors();
}, []);


  useEffect(() => {
    fetchExpenses();
  }, [refreshFlag]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, dateFilter]);

  const filteredExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.expense_date);
    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

    const matchesCategory = !categoryFilter || exp.category === categoryFilter;
    const matchesVendor = !vendorFilter || exp.vendor_id == vendorFilter;
    const matchesSearch =
      !searchQuery ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.supplier || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFrom = !fromDate || expDate >= fromDate;
    const matchesTo = !toDate || expDate <= toDate;

    return matchesVendor && matchesCategory && matchesSearch && matchesFrom && matchesTo;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const confirmDelete = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      toast.success("Expense deleted successfully");
      fetchExpenses();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete expense");
    } finally {
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleDeleteCancelled = () => {
    setDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  const handleEdit = (expense) => {
    if (onEditExpense) onEditExpense(expense);
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) return <div className="expenses-loading">Loading expenses...</div>;
  if (!expenses.length) return <div className="no-expenses">No expenses recorded yet.</div>;

  return (
    <div className="expense-list-container">
      <h2 className="list-title">All Expenses</h2>

      <div className="expense-filters">
        <input
          type="text"
          placeholder="Search description or supplier"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
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
          onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))}
        />
        <input
          type="date"
          value={dateFilter.to}
          onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))}
        />
        <select
  value={vendorFilter}
  onChange={(e) => setVendorFilter(e.target.value)}
>
  <option value="">All Vendors</option>
  {vendors.map(v => (
    <option key={v.id} value={v.id}>{v.name}</option>
  ))}
</select>
      </div>

      <div className="expense-table-wrapper">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentExpenses.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.description}</td>
                <td>₦{Number(exp.amount).toLocaleString()}</td>
                <td>{exp.category}</td>
                <td>{exp.supplier || "-"}</td>
                <td>{exp.vendor_name || "-"}</td>
                <td>{new Date(exp.expense_date).toLocaleDateString()}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(exp)}>Edit</button>
                  <button className="delete-btn" onClick={() => confirmDelete(exp)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="expense-card-list">
        {currentExpenses.map((exp) => (
          <div key={exp.id} className="expense-card">
            <div className="card-row">
              <span className="card-label">Description:</span>
              <span>{exp.description}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Amount:</span>
              <span>₦{Number(exp.amount).toLocaleString()}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Category:</span>
              <span>{exp.category}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Supplier:</span>
              <span>{exp.supplier || "-"}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Date:</span>
              <span>{new Date(exp.expense_date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={handleDeleteCancelled}
        message={`Are you sure you want to delete "${expenseToDelete?.description}"?`}
      />
    </div>
  );
};

export default ExpenseList;
