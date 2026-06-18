import React, { useState, useEffect } from "react";
import { vendorService } from "../../services/vendorService";
import { expenseService } from "../../services/expenseService";
import toast from "react-hot-toast";
import "../../styles/shared/PremiumShared.css";

const BulkExpenseForm = ({ onSuccess }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([
        { description: "", amount: "", category: "", supplier: "", vendor_id: "", status: "unsettled" },
        { description: "", amount: "", category: "", supplier: "", vendor_id: "", status: "unsettled" }
    ]);

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

    const handleRowChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { description: "", amount: "", category: "", supplier: "", vendor_id: "", status: "unsettled" }]);
    };

    const removeRow = (index) => {
        if (rows.length > 1) {
            setRows(rows.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validRows = rows.filter(r => r.description && r.amount && r.category);

        if (validRows.length === 0) {
            toast.error("Please fill at least one row");
            return;
        }

        setLoading(true);
        try {
            const response = await expenseService.bulkCreateExpenses(validRows);
            if (response.data.success) {
                toast.success(`Successfully saved ${validRows.length} expenses!`);

                setRows([
                    { description: "", amount: "", category: "", supplier: "", vendor_id: "", status: "unsettled" },
                    { description: "", amount: "", category: "", supplier: "", vendor_id: "", status: "unsettled" }
                ]);
                if (onSuccess) onSuccess();
            } else {
                toast.error("Failed to save expenses");
            }
        } catch (error) {
            console.error("Bulk expense error:", error);
            toast.error("An error occurred while saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="premium-card" style={{ marginBottom: '30px' }}>
            <form onSubmit={handleSubmit}>
                <div className="premium-table-wrapper" style={{ overflowX: 'auto', marginBottom: '20px' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Description *</th>
                                <th>Amount *</th>
                                <th>Category *</th>
                                <th>Supplier</th>
                                <th>Vendor</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            className="premium-input"
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={row.description}
                                            onChange={(e) => handleRowChange(index, "description", e.target.value)}
                                            placeholder="Description"
                                            required={index < 1}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="premium-input"
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={row.amount}
                                            onChange={(e) => handleRowChange(index, "amount", e.target.value)}
                                            placeholder="0.00"
                                            required={index < 1}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="premium-input"
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={row.category}
                                            onChange={(e) => handleRowChange(index, "category", e.target.value)}
                                            required={index < 1}
                                        >
                                            <option value="">Select</option>
                                            <option value="Food">Food</option>
                                            <option value="Fuel">Fuel</option>
                                            <option value="Supplies">Supplies</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Misc">Misc</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="premium-input"
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={row.supplier}
                                            onChange={(e) => handleRowChange(index, "supplier", e.target.value)}
                                            placeholder="Supplier"
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="premium-input"
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={row.vendor_id}
                                            onChange={(e) => handleRowChange(index, "vendor_id", e.target.value)}
                                        >
                                            <option value="">Vendor</option>
                                            {vendors.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            className="premium-input"
                                            style={{ padding: '8px', fontSize: '13px' }}
                                            value={row.status}
                                            onChange={(e) => handleRowChange(index, "status", e.target.value)}
                                        >
                                            <option value="unsettled">Unsettled</option>
                                            <option value="settled">Settled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="item-action-btn delete"
                                            onClick={() => removeRow(index)}
                                            style={{ padding: '5px 10px' }}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <button type="button" className="page-btn" onClick={addRow}>
                        + Add Row
                    </button>
                    <button type="submit" className="submit-btn" style={{ margin: 0, width: 'auto', minWidth: '200px' }} disabled={loading}>
                        {loading ? "Saving..." : "Submit All Expenses"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BulkExpenseForm;
