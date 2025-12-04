// src/pages/Users/InviteUsers.jsx
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import {
  getInvites,
  inviteUser,
  cancelInvite,
  deleteInvite,
} from "../../api/invites"; // make sure deleteInvite exists
import "../../styles/pages/InviteUsers.css";

export default function InviteUsers() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cashier");
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load invites
  const loadInvites = async () => {
    try {
      const res = await getInvites();
      setInvites(res.data.invites || []);
    } catch (err) {
      console.error("Failed to load invites:", err);
      toast.error("Failed to load invites");
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  // Handle sending new invite
  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Enter an email");
      return;
    }

    setLoading(true);

    try {
      await inviteUser(email, role);
      setEmail("");
      await loadInvites();
      toast.success("Invite sent successfully!");
    } catch (err) {
      console.error("Invite error:", err);
      toast.error(err.response?.data?.error || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel invite (pending only)
  const handleCancel = async (inviteId) => {
    try {
      await cancelInvite(inviteId);
      toast.success("Invite cancelled successfully");
      await loadInvites();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel invite");
    }
  };

  // Handle delete invite (cancelled only)
  const handleDelete = async (inviteId) => {
    try {
      await deleteInvite(inviteId);
      toast.success("Invite deleted successfully");
      await loadInvites();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invite");
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Header />
      <Sidebar />
      <div className="invite-container">
        <div className="invite-header">
          <h2>Invite Team Members</h2>
          <p className="invite-sub">Send invitations to users with assigned roles.</p>
        </div>

        {/* Invite Form */}
        <div className="invite-card">
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

        {/* Invites Table */}
        <div className="invite-table-wrapper">
          <h3>Your Invites</h3>

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
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No invites
                  </td>
                </tr>
              ) : (
                invites.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td className="role-badge">{inv.role_name}</td>
                    <td>{inv.status}</td>
                    <td>{new Date(inv.created_at).toLocaleString()}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
