"use client";

import React from "react";
import { formStyles as styles } from "./FormStyles";

export default function BasicInfo({ formData, handleChange }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Basic Information</h3>
      <div style={styles.formGroup}>
        <label style={styles.label}>Product Name *</label>
        <input required type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} style={{...styles.input, height: "150px"}} />
      </div>
    </div>
  );
}
