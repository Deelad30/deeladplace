import React, { useState, useEffect } from "react";
import { vendorService } from "../../services/vendorService";
import { expenseService } from "../../services/expenseService";
import toast from "react-hot-toast";
import "../../styles/components/expenses/ExpenseForm.css";

const ExpenseForm = ({ onClose, onSuccess, editExpense  }) => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
  description: "",
  amount: "",
  supplier: "",
  category: "",
  vendor_id: "",
  expense_date: "",
});

    useEffect(() => {
if (editExpense) {
  setFormData({
    description: editExpense.description,
    amount: editExpense.amount,
    category: editExpense.category,
    supplier: editExpense.supplier || "",
    vendor_id: editExpense.vendor_id,
    expense_date: editExpense.expense_date.slice(0, 10)
  });
 }    else {
      // Clear form if no editExpense
      setFormData({
        description: "",
        amount: "",
        category: "",
        vendor_id: "",
        supplier: "",
        expense_date: "",
      });
    }
  }, [editExpense]);

  useEffect(() => {
  const loadVendors = async () => {
    try {
      const res = await vendorService.getAllVendors();
      setVendors(res.data.vendors);
    } catch (err) {
      toast.error("Failed to load vendors");
    }
  };

  loadVendors();
}, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.description || !formData.amount || !formData.category) {
    toast.error("Please fill all required fields");
    return;
  }

  try {
    let response;
    if (editExpense) {
      // Update existing expense
      response = await expenseService.updateExpense(editExpense.id, formData);
    } else {
      // Create new expense
      response = await expenseService.createExpense(formData);
    }

    if (response.data.success) {
      toast.success(`Expense ${editExpense ? "updated" : "added"} successfully!`);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  } catch (error) {
    console.log("Expense submit error:", error);
    toast.error(`Failed to ${editExpense ? "update" : "add"} expense`);
  }
};


  return (
    <div className="expense-form-card">
      <h2>Add New Expense</h2>

      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Description *</label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Office supplies"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Vendor *</label>
          <select
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleChange}
          >
            <option value="">Select Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              placeholder="e.g. 5000"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Fuel">Fuel</option>
              <option value="Supplies">Supplies</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Utilities">Utilities</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Supplier</label>
          <input
            type="text"
            name="supplier"
            placeholder="e.g. Stationery Shop"
            value={formData.supplier}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Expense Date</label>
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
          />
        </div>

        <button className="submit-btn" type="submit">
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
