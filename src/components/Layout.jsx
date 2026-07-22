import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("artistic_carpets_admin_token");

  useEffect(() => {
    // Check authentication redirect
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return null; // Don't render layout if not authenticated
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        {/* Top Header */}
        <header style={styles.header}>
          <div style={styles.status}>
            <span style={styles.statusIndicator}></span>
            <span style={styles.statusText}>Server Connected</span>
          </div>
          <div style={styles.time}>
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="admin-content fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  header: {
    height: "var(--header-height)",
    backgroundColor: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    flexShrink: 0,
    boxShadow: "var(--shadow-sm)",
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--color-success)",
    display: "inline-block",
    boxShadow: "0 0 6px var(--color-success)",
  },
  statusText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },
  time: {
    fontSize: "13px",
    color: "var(--text-muted)",
    fontWeight: "500",
  },
};
