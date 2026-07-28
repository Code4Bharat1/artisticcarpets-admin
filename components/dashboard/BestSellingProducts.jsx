import React from "react";

export default function BestSellingProducts({ products = [] }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="card-luxury" style={{ gridColumn: "span 2" }}>
      <div className="card-header-flex">
        <div>
          <h3 className="card-title">Best Selling Products</h3>
          <p className="card-subtitle">Top performing carpets this month</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
        {products.map((product, index) => (
          <div key={product.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ 
                  width: "24px", 
                  height: "24px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "700"
                }}>
                  {index + 1}
                </div>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{product.name}</span>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>{product.sales} sales</span>
                <span style={{ fontWeight: "600" }}>{formatCurrency(product.revenue)}</span>
              </div>
            </div>
            <div className="progress-container">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${product.percentage}%`,
                  backgroundColor: index < 3 ? "var(--primary-brand)" : "var(--color-warning)"
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
