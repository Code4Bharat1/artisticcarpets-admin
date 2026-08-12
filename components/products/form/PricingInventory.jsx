"use client";

import React from "react";
import { formStyles as styles } from "./FormStyles";

export default function PricingInventory({ formData, handleChange }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Pricing & Inventory</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Original Price * (₹)</label>
          <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Discount Price (₹)</label>
          <input type="number" min="0" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>SKU *</label>
          <input required type="text" name="sku" value={formData.sku} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Stock Quantity *</label>
          <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} style={styles.input} />
        </div>
      </div>
    </div>
  );
}
