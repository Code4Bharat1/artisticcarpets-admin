"use client";

import React from "react";
import { formStyles as styles } from "./FormStyles";

export default function ProductSpecs({ formData, handleChange }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Product Specifications</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>

        <div style={styles.formGroup}>
          <label style={styles.label}>Color</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Origin</label>
          <input type="text" name="origin" value={formData.origin} onChange={handleChange} style={styles.input} />
        </div>
      </div>
    </div>
  );
}
