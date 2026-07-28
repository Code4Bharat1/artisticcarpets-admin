import React from "react";
import { Plus, Image as ImageIcon, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="card-luxury">
      <div className="card-header-flex">
        <div>
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">Common administrative tasks</p>
        </div>
      </div>

      <div className="quick-actions-grid" style={{ marginTop: "12px" }}>
        <Link href="/products/new" style={{ textDecoration: "none" }}>
          <div className="action-card">
            <Plus size={24} />
            <span>Add Product</span>
          </div>
        </Link>
        <Link href="/cms" style={{ textDecoration: "none" }}>
          <div className="action-card">
            <ImageIcon size={24} />
            <span>Manage Banners</span>
          </div>
        </Link>
        <Link href="/customers" style={{ textDecoration: "none" }}>
          <div className="action-card">
            <Users size={24} />
            <span>Customers</span>
          </div>
        </Link>
        <Link href="/settings" style={{ textDecoration: "none" }}>
          <div className="action-card">
            <Settings size={24} />
            <span>Store Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
