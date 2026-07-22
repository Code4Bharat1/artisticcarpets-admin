import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Eye
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrdersList = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest.get("/orders", {
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      });

      if (data.success) {
        setOrders(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      setError("Failed to fetch order records. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, [page, status, paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrdersList();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPage(1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Orders Management</h2>
          <p style={styles.subtitle}>Search, filter, and manage platform orders ({totalCount} total)</p>
        </div>
        <button onClick={fetchOrdersList} className="btn btn-secondary" style={styles.refreshBtn}>
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
          <button type="submit" className="btn btn-primary" style={styles.searchBtn}>Search</button>
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div style={styles.filterSelectGroup}>
            <Filter size={14} style={{ color: "var(--text-muted)" }} />
            <select
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
              className="form-select"
              style={styles.selectStyle}
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {(search || status || paymentStatus) && (
            <button onClick={handleResetFilters} className="btn btn-outline" style={styles.resetBtn}>
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ padding: "12px", width: "100%", borderRadius: "var(--border-radius-sm)", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="table-container">
        {loading ? (
          <div style={styles.loadingState}>
            <RefreshCw className="animate-spin" size={24} style={{ color: "var(--primary-brand)" }} />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.noDataState}>No orders found matching the filter criteria.</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Fulfillment</th>
                <th>Payment</th>
                <th>Date Placed</th>
                <th>Total Value</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id || order._id}>
                  <td style={{ fontWeight: "600", color: "var(--primary-brand)" }}>
                    {order.orderNumber}
                  </td>
                  <td>
                    <div style={styles.custName}>{order.customerSnapshot?.name || "Guest Customer"}</div>
                    <div style={styles.custEmail}>{order.customerSnapshot?.email || "No email"}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${
                      order.status === "delivered" ? "success" :
                      order.status === "pending" ? "warning" :
                      order.status === "cancelled" ? "danger" : "info"
                    }`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${
                      order.payment?.status === "paid" ? "success" :
                      order.payment?.status === "pending" ? "warning" : "danger"
                    }`}>
                      {order.payment?.status || "unknown"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                    {formatCurrency(order.total)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link to={`/orders/${order.id || order._id}`} className="btn btn-secondary" style={styles.detailBtn}>
                      <Eye size={13} />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            style={styles.pageBtn}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={styles.pageIndicator}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            style={styles.pageBtn}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginTop: "2px",
  },
  refreshBtn: {
    padding: "9px 15px",
    fontSize: "13px",
  },
  filterBar: {
    padding: "18px 22px",
    borderRadius: "var(--border-radius)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "4px",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--shadow-xs)",
  },
  searchForm: {
    display: "flex",
    gap: "10px",
    flex: 1,
    minWidth: "280px",
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    color: "var(--text-muted)",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-sm)",
    padding: "9px 12px 9px 40px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
  },
  searchBtn: {
    padding: "9px 16px",
    fontSize: "13px",
  },
  selectsWrapper: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterSelectGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-sm)",
    paddingLeft: "12px",
  },
  selectStyle: {
    border: "none",
    backgroundColor: "transparent",
    padding: "9px 30px 9px 0px",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  },
  resetBtn: {
    padding: "9px 13px",
    fontSize: "13px",
  },
  detailBtn: {
    padding: "7px 12px",
    fontSize: "12px",
  },
  custName: {
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  custEmail: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "1px",
  },
  loadingState: {
    padding: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "var(--text-secondary)",
  },
  noDataState: {
    padding: "50px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "14px",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginTop: "28px",
  },
  pageIndicator: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "500",
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    borderRadius: "var(--border-radius-sm)",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "var(--transition-fast)",
  },
};
