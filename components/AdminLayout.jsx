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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Order", message: "Order ORD-74485 has been placed", time: "5 min ago", unread: true },
    { id: 2, title: "Refund Requested", message: "Customer requested a refund for ORD-74484", time: "1 hr ago", unread: true },
    { id: 3, title: "Low Stock", message: "Wool Yarn is running low on stock", time: "3 hrs ago", unread: false },
  ]);

  const markAllAsRead = (e) => {
    e.stopPropagation();
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("artistic_carpets_admin_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isNotificationOpen && !e.target.closest('.notification-bell')) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isNotificationOpen]);

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
    if (pathname.startsWith("/complaints")) return "Support Complaints";
    return "Admin Dashboard";
  };

  const hideTitleOnMobile = pathname === "/orders" || pathname.startsWith("/products") || pathname.startsWith("/inventory") || pathname.startsWith("/complaints") || pathname === "/cms";

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
              <h1 style={styles.pageTitle} className={hideTitleOnMobile ? "mobile-hide-title" : ""}>{getPageTitle()}</h1>
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
            
            <div className="notification-bell" onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={20} />
              {notifications.some(n => n.unread) && <div className="notification-badge" style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, backgroundColor: "var(--color-danger)", borderRadius: "50%" }}></div>}
              
              {isNotificationOpen && (
                <div className="notification-dropdown" style={styles.notificationDropdown} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.notificationHeader}>
                    <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Notifications</h3>
                    <span style={{ fontSize: "12px", color: "var(--primary-brand)", cursor: "pointer" }} onClick={markAllAsRead}>Mark all as read</span>
                  </div>
                  <div style={styles.notificationList}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ ...styles.notificationItem, backgroundColor: n.unread ? "var(--bg-secondary)" : "transparent" }}>
                        <div style={styles.notificationTitle}>{n.title}</div>
                        <div style={styles.notificationMessage}>{n.message}</div>
                        <div style={styles.notificationTime}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
  notificationDropdown: {
    position: "absolute",
    top: "40px",
    right: "-10px",
    width: "320px",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-md)",
    boxShadow: "var(--shadow-md)",
    zIndex: 100,
    cursor: "default",
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-color)",
  },
  notificationList: {
    maxHeight: "360px",
    overflowY: "auto",
  },
  notificationItem: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  notificationTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  notificationMessage: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  notificationTime: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
};
