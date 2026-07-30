"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FileText, LogOut, Package, HelpCircle, RefreshCw, AlertTriangle, Warehouse } from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  const adminData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("artistic_carpets_admin_user") || "{}")
      : {};

  const handleLogout = () => {
    localStorage.removeItem("artistic_carpets_admin_token");
    localStorage.removeItem("artistic_carpets_admin_user");
    router.push("/login");
  };

  const displayName =
    adminData.name === "Super Admin" ? "Admin" : adminData.name || "Admin";

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "Orders", icon: ShoppingBag },
    { href: "/products", label: "Products", icon: Package },
    { href: "/inventory", label: "Inventory", icon: Warehouse },
    { href: "/complaints", label: "Support", icon: HelpCircle },
    { href: "/cms", label: "CMS Editor", icon: FileText },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`} style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <img src="/admin/logo2.jpeg" alt="Artistic Carpets" style={{ height: "50px", objectFit: "contain", marginBottom: "8px" }} />
      </div>

      {/* Nav Menu */}
      <nav style={styles.nav}>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
            >
              <Icon size={19} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div style={styles.footer}>
        <div style={styles.profile}>
          <div style={styles.avatar}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <p style={styles.profileName}>{displayName}</p>
            <p style={styles.profileRole}>Administrator</p>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "var(--sidebar-width)",
    backgroundColor: "var(--bg-secondary)",
    borderRight: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    flexShrink: 0,
  },
  brand: {
    padding: "28px 24px",
    borderBottom: "1px solid var(--border-color)",
  },
  brandTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: "21px",
    fontWeight: "bold",
    letterSpacing: "-0.01em",
    color: "var(--text-primary)",
  },
  brandSubtitle: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--primary-brand)",
    fontWeight: "700",
    marginTop: "3px",
    display: "block",
  },
  nav: {
    padding: "20px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 16px",
    borderRadius: "var(--border-radius-sm)",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: "500",
    transition: "var(--transition-fast)",
    cursor: "pointer",
    textDecoration: "none",
  },
  navLinkActive: {
    backgroundColor: "var(--primary-brand-light)",
    color: "var(--primary-brand)",
    fontWeight: "600",
  },
  footer: {
    padding: "20px 16px",
    borderTop: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    backgroundColor: "var(--bg-secondary)",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-brand)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 2px 8px rgba(108, 29, 27, 0.15)",
  },
  profileInfo: {
    overflow: "hidden",
  },
  profileName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  profileRole: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    width: "100%",
    padding: "11px 16px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-sm)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "var(--transition-fast)",
  },
};
