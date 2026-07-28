import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RecentOrdersTable({ orders = [] }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="card-luxury" style={{ gridColumn: "span 2" }}>
      <div className="card-header-flex">
        <div>
          <h3 className="card-title">Recent Orders</h3>
          <p className="card-subtitle">Latest customer transactions</p>
        </div>
        <Link href="/orders" className="btn btn-secondary" style={{ fontSize: "12px", padding: "6px 14px" }}>
          View All
        </Link>
      </div>

      <div className="table-container" style={{ marginTop: "8px", boxShadow: "none", border: "none" }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ fontWeight: "600", color: "var(--primary-brand)" }}>{order.orderNumber}</td>
                <td style={{ fontWeight: "500" }}>{order.customerSnapshot?.name || "Guest"}</td>
                <td style={{ color: "var(--text-secondary)" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={{ fontWeight: "600" }}>{formatCurrency(order.total)}</td>
                <td>
                  <span className={`badge badge-${
                    order.status === "delivered" ? "success" :
                    order.status === "pending" ? "warning" :
                    order.status === "cancelled" ? "danger" : "info"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button style={{ 
                    background: "transparent", 
                    border: "none", 
                    color: "var(--text-muted)", 
                    cursor: "pointer",
                    padding: "4px"
                  }}>
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
