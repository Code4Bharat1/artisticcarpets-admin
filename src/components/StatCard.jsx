import React from "react";

export default function StatCard({ title, value, icon: Icon, accentColor = "var(--primary-brand)" }) {
  return (
    <div style={styles.card} className="glass">
      <div style={styles.left}>
        <span style={styles.title}>{title}</span>
        <h3 style={styles.value}>{value}</h3>
      </div>
      <div style={{
        ...styles.iconWrapper,
        backgroundColor: accentColor === "var(--primary-brand)" ? "var(--primary-brand-light)" : "var(--bg-tertiary)",
        color: accentColor
      }}>
        <Icon size={22} />
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "24px",
    borderRadius: "var(--border-radius)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "var(--transition-smooth)",
    cursor: "default",
    boxShadow: "var(--shadow-sm)",
    backgroundColor: "var(--bg-secondary)",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  title: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  value: {
    fontSize: "26px",
    fontWeight: "700",
    color: "var(--text-primary)",
    fontFamily: "var(--font-serif)",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "var(--border-radius-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-smooth)",
  },
};
