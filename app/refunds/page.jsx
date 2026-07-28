"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/api";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Loader2,
} from "lucide-react";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRefundsList = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest.get("/refunds", {
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      });
      if (data.success) {
        setRefunds(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      setError("Failed to fetch refund records. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundsList();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRefundsList();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    let bg = "#F3F4F6", color = "#374151";
    switch (status?.toLowerCase()) {
      case "pending":
        bg = "#FEF3C7"; color = "#92400E"; break;
      case "approved":
        bg = "#DBEAFE"; color = "#1E40AF"; break;
      case "rejected":
        bg = "#FEE2E2"; color = "#B91C1C"; break;
      case "refunded":
        bg = "#D1FAE5"; color = "#065F46"; break;
      default: break;
    }
    return <span style={{ ...styles.badge, backgroundColor: bg, color }}>{status || "Unknown"}</span>;
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Refund Management</h2>
            <p style={styles.subtitle}>
              Manage and process customer refund requests ({totalCount} total)
            </p>
          </div>
          <button
            onClick={fetchRefundsList}
            className="btn btn-secondary"
            style={styles.refreshBtn}
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={styles.filterBar} className="glass">
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <div style={styles.searchWrapper}>
              <Search size={17} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by order number or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={styles.searchBtn}>
              Search
            </button>
          </form>

          <div style={styles.selectsWrapper}>
            <div style={styles.filterSelectGroup}>
              <Filter size={14} style={{ color: "var(--text-muted)" }} />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="form-select"
                style={styles.selectStyle}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {(search || status) && (
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={styles.resetBtn}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Data Table */}
        <div style={styles.tableContainer} className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Requested Date</th>
                <th>Refund Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={styles.loadingCell}>
                    <Loader2 size={24} className="spin" style={styles.loader} />
                    <span>Loading refunds...</span>
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyCell}>
                    <div style={styles.emptyState}>
                      <p>No refund requests found.</p>
                      {(search || status) && (
                        <button onClick={handleResetFilters} style={styles.clearFilterBtn}>
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                refunds.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div style={styles.orderId}>{order.orderNumber}</div>
                    </td>
                    <td>
                      <div style={styles.customerInfo}>
                        <p style={styles.customerName}>{order.customerSnapshot?.name || "Unknown"}</p>
                      </div>
                    </td>
                    <td>
                      <div style={styles.dateInfo}>
                        {formatDate(order.refund?.requestedAt)}
                      </div>
                    </td>
                    <td>
                      <div style={styles.amount}>
                        {formatCurrency(order.total)}
                      </div>
                    </td>
                    <td>{getStatusBadge(order.refund?.status)}</td>
                    <td>
                      <div style={styles.actions}>
                        <Link
                          href={`/refunds/${order._id}`}
                          className="btn btn-secondary"
                          style={styles.actionBtn}
                          title="View Refund Details"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={styles.pagination}>
            <div style={styles.pageInfo}>
              Showing page {page} of {totalPages}
            </div>
            <div style={styles.pageControls}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
                style={styles.pageBtn}
              >
                <ChevronLeft size={16} />
              </button>
              
              <div style={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`btn ${page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        ...styles.pageNumberBtn,
                        ...(page === pageNum ? styles.activePageBtn : {})
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
                style={styles.pageBtn}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </AdminLayout>
  );
}

const styles = {
  container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title: { fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 8px 0" },
  subtitle: { color: "var(--text-secondary)", margin: 0, fontSize: "14px" },
  refreshBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" },
  
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "var(--bg-primary)",
    borderRadius: "var(--border-radius-md)",
    marginBottom: "24px",
    border: "1px solid var(--border-color)",
    flexWrap: "wrap",
    gap: "16px",
  },
  searchForm: { display: "flex", gap: "12px", flex: "1 1 300px" },
  searchWrapper: { position: "relative", flex: 1, display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", color: "var(--text-muted)" },
  searchInput: {
    width: "100%", padding: "10px 12px 10px 36px",
    borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px"
  },
  searchBtn: { padding: "10px 20px", whiteSpace: "nowrap" },
  
  selectsWrapper: { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" },
  filterSelectGroup: {
    display: "flex", alignItems: "center", gap: "8px",
    backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-sm)", padding: "0 12px"
  },
  selectStyle: { border: "none", backgroundColor: "transparent", padding: "10px 0", color: "var(--text-primary)", outline: "none", cursor: "pointer", fontSize: "13px" },
  resetBtn: { padding: "10px 16px", fontSize: "13px" },
  
  error: { backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", padding: "16px", borderRadius: "var(--border-radius-sm)", marginBottom: "24px", fontSize: "14px" },
  
  tableContainer: { backgroundColor: "var(--bg-primary)", borderRadius: "var(--border-radius-md)", overflow: "hidden", border: "1px solid var(--border-color)" },
  
  orderId: { fontWeight: "600", color: "var(--text-primary)", fontSize: "14px" },
  customerInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  customerName: { margin: 0, fontWeight: "500", fontSize: "14px", color: "var(--text-primary)" },
  
  dateInfo: { fontSize: "14px", color: "var(--text-secondary)" },
  amount: { fontWeight: "600", color: "var(--text-primary)" },
  
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block" },
  
  actions: { display: "flex", gap: "8px" },
  actionBtn: { padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" },
  
  loadingCell: { textAlign: "center", padding: "48px", color: "var(--text-muted)" },
  loader: { margin: "0 auto 12px auto", color: "var(--primary-brand)" },
  emptyCell: { textAlign: "center", padding: "48px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "var(--text-muted)" },
  clearFilterBtn: { background: "none", border: "none", color: "var(--primary-brand)", textDecoration: "underline", cursor: "pointer", fontSize: "14px" },
  
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderTop: "1px solid var(--border-color)", marginTop: "24px" },
  pageInfo: { fontSize: "14px", color: "var(--text-secondary)" },
  pageControls: { display: "flex", gap: "8px", alignItems: "center" },
  pageNumbers: { display: "flex", gap: "4px" },
  pageBtn: { padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" },
  pageNumberBtn: { width: "32px", height: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" },
  activePageBtn: { pointerEvents: "none" },
};
