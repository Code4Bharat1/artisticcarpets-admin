import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import StatCard from "../components/StatCard";
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  TrendingUp, 
  ArrowRight,
  TrendingDown,
  RefreshCw
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, ordersData] = await Promise.all([
        apiRequest.get("/orders/stats/overview"),
        apiRequest.get("/orders", { limit: 5 })
      ]);

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (ordersData.success) {
        setRecentOrders(ordersData.data || []);
      }
    } catch (err) {
      setError("Failed to load dashboard metrics. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw className="animate-spin" size={28} style={{ color: "var(--primary-brand)" }} />
        <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Row */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Store Overview</h2>
          <p style={styles.subtitle}>Real-time sales performance and recent customer activity</p>
        </div>
        <button onClick={loadDashboardData} className="btn btn-secondary" style={styles.refreshBtn}>
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ padding: "12px 16px", width: "100%", borderRadius: "var(--border-radius-sm)", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="stats-grid">
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats.monthRevenue || 0)}
            icon={DollarSign}
            accentColor="var(--color-success)"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders || 0}
            icon={Clock}
            accentColor="var(--color-warning)"
          />
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders || 0}
            icon={ShoppingBag}
            accentColor="var(--color-info)"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(stats.avgOrderValue || 0)}
            icon={TrendingUp}
            accentColor="var(--primary-brand)"
          />
        </div>
      )}

      {/* Main Grid split */}
      <div style={styles.gridSplit}>
        {/* Left Column: Recent Orders */}
        <div style={styles.columnLeft}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Orders</h3>
            <Link to="/orders" style={styles.viewAllLink}>
              <span>View All Orders</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="table-container" style={{ marginTop: "12px" }}>
            {recentOrders.length === 0 ? (
              <div style={styles.noData}>No recent orders available.</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id || order._id}>
                      <td style={{ fontWeight: "600", color: "var(--primary-brand)" }}>
                        {order.orderNumber}
                      </td>
                      <td>
                        <div style={styles.customerName}>
                          {order.customerSnapshot?.name || "Guest Customer"}
                        </div>
                        <div style={styles.customerEmail}>
                          {order.customerSnapshot?.email || ""}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                        {formatCurrency(order.total)}
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
                        <Link to={`/orders/${order.id || order._id}`} style={styles.actionBtn}>
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Mini stats list */}
        <div style={styles.columnRight} className="glass">
          <h3 style={styles.sideTitle}>Fulfillment Summary</h3>
          <div style={styles.sideContent}>
            {stats && (
              <>
                <div style={styles.healthItem}>
                  <div style={styles.healthLabel}>
                    <CheckCircle size={17} style={{ color: "var(--color-success)" }} />
                    <span>Delivered Orders</span>
                  </div>
                  <span style={styles.healthValue}>{stats.completedOrders || 0}</span>
                </div>

                <div style={styles.healthItem}>
                  <div style={styles.healthLabel}>
                    <Clock size={17} style={{ color: "var(--color-warning)" }} />
                    <span>Monthly Orders</span>
                  </div>
                  <span style={styles.healthValue}>{stats.monthOrders || 0}</span>
                </div>

                <div style={styles.healthItem}>
                  <div style={styles.healthLabel}>
                    <TrendingDown size={17} style={{ color: "var(--color-danger)" }} />
                    <span>Returned & Refunded</span>
                  </div>
                  <span style={styles.healthValue}>{stats.returnedOrders || 0}</span>
                </div>

                <div style={styles.healthItem}>
                  <div style={styles.healthLabel}>
                    <TrendingDown size={17} style={{ color: "var(--text-muted)" }} />
                    <span>Cancelled Orders</span>
                  </div>
                  <span style={styles.healthValue}>{stats.cancelledOrders || 0}</span>
                </div>
              </>
            )}
            
            <div style={styles.systemDetails}>
              <h4 style={styles.sysHeader}>System Overview</h4>
              <div style={styles.sysRow}>
                <span>API Status:</span>
                <span style={{ color: "var(--color-success)", fontWeight: "600" }}>Active</span>
              </div>
              <div style={styles.sysRow}>
                <span>Environment:</span>
                <span style={{ textTransform: "capitalize" }}>Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
  },
  loadingContainer: {
    height: "calc(100vh - var(--header-height) - 80px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
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
  gridSplit: {
    display: "flex",
    gap: "28px",
    marginTop: "4px",
    alignItems: "flex-start",
  },
  columnLeft: {
    flex: 1,
  },
  columnRight: {
    width: "300px",
    borderRadius: "var(--border-radius)",
    padding: "22px",
    flexShrink: 0,
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--shadow-sm)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
  },
  viewAllLink: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--primary-brand)",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    transition: "var(--transition-fast)",
  },
  noData: {
    padding: "40px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "14px",
  },
  customerName: {
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  customerEmail: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "1px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    transition: "var(--transition-fast)",
  },
  sideTitle: {
    fontSize: "16px",
    fontWeight: "600",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "12px",
    marginBottom: "16px",
  },
  sideContent: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  healthItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  healthValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  systemDetails: {
    marginTop: "18px",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "14px",
  },
  sysHeader: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "10px",
  },
  sysRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    marginBottom: "6px",
    color: "var(--text-secondary)",
  },
};
