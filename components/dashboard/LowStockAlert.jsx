import React from "react";
import { AlertTriangle, Plus } from "lucide-react";
import Image from "next/image";

export default function LowStockAlert({ products = [] }) {
  return (
    <div className="card-luxury">
      <div className="card-header-flex">
        <div>
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} color="var(--color-warning)" />
            Low Stock Alerts
          </h3>
          <p className="card-subtitle">Products needing restock</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        {products.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "10px 0" }}>
            All products are sufficiently stocked.
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="list-item-luxury">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: "12px",
                fontWeight: "600",
                overflow: "hidden"
              }}>
                {product.mainImage ? (
                  <img src={product.mainImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  "IMG"
                )}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>{product.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{product.sku}</div>
                <div style={{ 
                  fontSize: "12px", 
                  fontWeight: "600",
                  color: "var(--color-danger)",
                  marginTop: "2px"
                }}>
                  {product.stock} left (Threshold: {product.threshold})
                </div>
              </div>
            </div>
            <button className="btn btn-outline" style={{ padding: "6px", borderRadius: "8px" }}>
              <Plus size={16} />
            </button>
          </div>
          ))
        )}
      </div>
      
      <button 
        className="btn btn-secondary" 
        style={{ width: "100%", marginTop: "16px", padding: "10px" }}
      >
        View All Inventory
      </button>
    </div>
  );
}
