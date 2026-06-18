import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Layout from '../../components/common/Layout';
import {
  getInvites,
  inviteUser,
  cancelInvite,
  deleteInvite,
} from "../../api/invites";
import "../../styles/pages/InviteUsers.css";

const ROLE_DESCRIPTIONS = {
  admin: "Full access to all system features, settings, and user management.",
  manager: "Manage operations, view all reports, manage inventory and vendors.",
  accountant: "Access to expenses, financial reports, and cost management.",
  inventory_officer: "Manage stock levels, purchase orders, and supplier interactions.",
  store_keeper: "Handle stock movements, verify deliveries, and manage raw materials.",
  auditor: "View-only access to reports and financial data for auditing purposes.",
  cashier: "Process sales, view daily transactions, and handle POS operations.",
  cashier_plus: "Process sales and manage limited stock adjustments.",
  kitchen_staff: "View recipes and manage raw material usage.",
  waiter: "Place orders (Save to Bill) but cannot settle sales or void bills."
};

export default function InviteUsers() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("waiter");
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadInvites = async () => {
    setFetching(true);
    try {
      const res = await getInvites();
      setInvites(res.data.invites || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invites");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleInvite = async () => {
    if (!email.trim()) return toast.error("Enter an email");
    setLoading(true);
    try {
      await inviteUser(email, role);
      setEmail("");
      await loadInvites();
      toast.success("Invite sent successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelInvite(id);
      toast.success("Invite cancelled successfully");
      await loadInvites();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel invite");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInvite(id);
      toast.success("Invite deleted successfully");
      await loadInvites();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invite");
    }
  };

  return (
    <Layout>
      <div className="invite-container modern">
        <div className="invite-header">
          <h2>Invite Team Members</h2>
          <p className="invite-sub">Send invitations to users with specific roles and permissions.</p>
        </div>

        <div className="invite-card">
          <div className="form-grid">
            <div className="form-group email-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>

            <div className="form-group role-group">
              <label>Role</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="inventory_officer">Inventory Officer</option>
                  <option value="store_keeper">Store Keeper</option>
                  <option value="auditor">Auditor</option>
                  <option value="cashier">Cashier</option>
                  <option value="cashier_plus">Cashier Plus</option>
                  <option value="kitchen_staff">Kitchen Staff</option>
                  <option value="waiter">Waiter</option>
                </select>
                <button
                  disabled={loading}
                  onClick={handleInvite}
                  className="invite-btn"
                >
                  {loading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </div>
          </div>

          <div className="role-description">
            <strong>{role.replace('_', ' ').toUpperCase()}:</strong> {ROLE_DESCRIPTIONS[role] || "Specific access permissions apply."}
          </div>
        </div>

        <div className="invite-table-wrapper">
          <h3>Pending & Active Invites</h3>

          {fetching ? (
            <div className="skeleton-table">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="skeleton-roww">
                  {[...Array(5)].map((__, i) => (
                    <div key={i} className="skeleton-cell"></div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              {invites.length === 0 ? (
                <div className="empty-state">
                  <p>No active invitations found.</p>
                </div>
              ) : (
                <table className="invite-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Sent Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>{inv.email}</td>
                        <td>
                          <span className={`role-badge ${inv.role_name}`}>{inv.role_name?.replace('_', ' ')}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${inv.status}`}>
                            {inv.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: "#6b7280", fontSize: "13px" }}>{new Date(inv.created_at).toLocaleDateString()}</td>

                        <td className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleCancel(inv.id)}
                            className="table-btn danger"
                            title="Cancel Invitation"
                          >
                            Revoke
                          </button>
                          {inv.status === "cancelled" && (
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="table-btn secondary"
                              title="Delete Record"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
