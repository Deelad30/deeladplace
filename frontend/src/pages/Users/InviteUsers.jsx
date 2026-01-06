import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import {
  getInvites,
  inviteUser,
  cancelInvite,
  deleteInvite,
} from "../../api/invites";
import "../../styles/pages/InviteUsers.css";

export default function InviteUsers() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cashier");
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
    <>
      <Toaster position="top-right" />
      <Header />
      <Sidebar />

      <div className="invite-container modern">
        <div className="invite-header">
          <h2>Invite Team Members</h2>
          <p className="invite-sub">Send invitations to users with assigned roles.</p>
        </div>

        <div className="invite-card shadow">
          <div className="form-grid">
            <div>
              <label>Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@example.com"
              />
            </div>

            <div>
              <label>Role</label>
              <select
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
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
              </select>
            </div>

            <div className="invite-btn-wrapper">
              <button
                disabled={loading}
                onClick={handleInvite}
                className="invite-btn"
              >
                {loading ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>

        <div className="invite-table-wrapper shadow">
          <h3>Your Invites</h3>

          {fetching ? (
            <div className="skeleton-table">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="skeleton-row">
                  {[...Array(5)].map((__, i) => (
                    <div key={i} className="skeleton-cell"></div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              {invites.length === 0 ? (
                <div className="empty-state">No invites</div>
              ) : (
                <table className="invite-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Sent</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight:"bold", fontSize:"15px" }}>{inv.email}</td>
                        <td>
                          <span className="role-badge">{inv.role_name}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${inv.status}`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(inv.created_at).toLocaleString()}</td>

                        {/* 🟢 PRESERVED EXACT SANCTITY OF ACTIONS CELL */}
                        <td className="table-actions">
                          <button
                            onClick={() => handleCancel(inv.id)}
                            className="table-btn danger"
                          >
                            Cancel
                          </button>
                          {inv.status === "cancelled" && (
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="table-btn secondary"
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
    </>
  );
}
