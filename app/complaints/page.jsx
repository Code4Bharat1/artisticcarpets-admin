"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get("/complaints");
      if (data && data.data) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}`, { status: newStatus });
      fetchComplaints();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  const filteredComplaints = complaints.filter(
    (c) =>
      c.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      c.issueType.toLowerCase().includes(search.toLowerCase()) ||
      c.orderId.toLowerCase().includes(search.toLowerCase()) ||
      (c.user?.name && c.user.name.toLowerCase().includes(search.toLowerCase()))
  );
 
  return (
    <AdminLayout>
      <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Support Complaints</h2>
          <p style={styles.subtitle}>
            Search, filter, and manage support tickets ({complaints.length} total)
          </p>
        </div>
        <button
          onClick={fetchComplaints}
          className="btn btn-secondary"
          style={styles.refreshBtn}
        >
          <RefreshCw size={15} />
          <span>Reload</span>
        </button>
      </div>

      <div style={styles.filterBar} className="glass">
        <form onSubmit={(e) => e.preventDefault()} style={styles.searchForm}>
          <div style={styles.searchWrapper}>
            <Search size={17} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search tickets, orders, or users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </form>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader2 size={32} style={styles.spinner} />
            <p>Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No complaints found.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Order ID</th>
                <th>Issue</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.ticketId}</strong>
                  </td>
                  <td>
                    {c.user?.name || "Unknown"}
                    <br />
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {c.user?.email}
                    </span>
                  </td>
                  <td>{c.orderId}</td>
                  <td>{c.issueType}</td>
                  <td>
                    <div style={styles.descriptionCell}>{c.description}</div>
                  </td>
                  <td>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        backgroundColor:
                          c.status === "Resolved"
                            ? "#ecfdf5"
                            : c.status === "Open"
                              ? "#eff6ff"
                              : "#fff7ed",
                        color:
                          c.status === "Resolved"
                            ? "#059669"
                            : c.status === "Open"
                              ? "#2563eb"
                              : "#ea580c",
                        borderColor:
                          c.status === "Resolved"
                            ? "#a7f3d0"
                            : c.status === "Open"
                              ? "#bfdbfe"
                              : "#ffedd5",
                      }}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}

const styles = {
   
    backLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      color: "var(--primary-brand)",
      textDecoration: "none",
      fontSize: "13px",
      fontWeight: "500",
      transition: "color 0.2s",

    },
  container: {
    backgroundColor: "#fafafa",
    minHeight: "100vh",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  title: { fontSize: "28px", fontWeight: "700" },
  subtitle: { fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" },
  refreshBtn: { padding: "9px 15px", fontSize: "13px" },
  filterBar: { padding: "18px 22px", borderRadius: "var(--border-radius)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap", marginBottom: "24px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)" },
  searchForm: { display: "flex", gap: "10px", flex: 1, minWidth: "280px" },
  searchWrapper: { position: "relative", flex: 1, display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "14px", color: "var(--text-muted)" },
  searchInput: { width: "100%", backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "9px 12px 9px 40px", fontSize: "14px", color: "var(--text-primary)", outline: "none" },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    fontSize: "12px",
    textTransform: "uppercase",
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
    verticalAlign: "top",
  },
  descriptionCell: {
    maxWidth: "250px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#6b7280",
    fontSize: "13px",
  },
  statusSelect: {
    padding: "4px 8px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid",
    cursor: "pointer",
    outline: "none",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
    color: "#6b7280",
  },
  spinner: {
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  emptyState: {
    padding: "48px",
    textAlign: "center",
    color: "#6b7280",
  },
};
