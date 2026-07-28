"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Search, Bell, Menu } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("artistic_carpets_admin_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Prevent hydration mismatch by rendering nothing until mounted on client
  if (!mounted) return null;

  const token = localStorage.getItem("artistic_carpets_admin_token");
  if (!token) return null;

  // Format the current route name for the dashboard title
  const getPageTitle = () => {
    if (pathname === "/") return "Admin Dashboard";
    if (pathname === "/orders") return "Orders Management";
    if (pathname.startsWith("/products")) return "Products Management";
    if (pathname === "/cms") return "Content Management";
    return "Admin Dashboard";
  };

  return (
    <div className="admin-layout">
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header" style={styles.header}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div style={styles.titleSection}>
              <h1 style={styles.pageTitle}>{getPageTitle()}</h1>
            <div style={styles.time}>
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
          
        <div className="header-actions">
           
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search orders, products..." />
            </div>
            
            <div className="notification-bell">
              <Bell size={20} />
              <div className="notification-badge"></div>
            </div>
            
            <div className="profile-menu">
              <div className="profile-avatar">A</div>
              <div className="profile-info">
                <span className="profile-name">Admin User</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="admin-content fade-in">{children}</div>
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
  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "700",
    margin: 0,
    fontFamily: "var(--font-serif)",
  },
  time: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: "500",
  },
};
