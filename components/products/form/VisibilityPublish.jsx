"use client";

import React from "react";
import { Loader2, Save } from "lucide-react";
import { formStyles as styles } from "./FormStyles";

export default function VisibilityPublish({ formData, handleChange, isEditing, isLoading }) {
  return (
    <>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Publish Status</h3>
        <div style={styles.formGroup}>
          <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
            <option value="active">Active (Published)</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        
        <button type="submit" disabled={isLoading} style={styles.submitBtn}>
          {isLoading ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
          <span>{isEditing ? "Save Changes" : "Publish Product"}</span>
        </button>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Organization</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Category *</label>
          <select required name="category" value={formData.category} onChange={handleChange} style={styles.input}>
            <option value="" disabled>Select a category</option>
            <option value="Tibettan Animal Skin Rugs">Tibettan Animal Skin Rugs</option>
            <option value="PERSIAN RUG">PERSIAN RUG</option>
            <option value="Modern Preminium Rugs">Modern Preminium Rugs</option>
            <option value="Modern Flower Rugs">Modern Flower Rugs</option>
            <option value="Animal Rectangle Rugs">Animal Rectangle Rugs</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Sub Category</label>
          <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Collection</label>
          <input type="text" name="productCollection" value={formData.productCollection} onChange={handleChange} style={styles.input} placeholder="e.g. Persian Rugs" />
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Visibility & Badges</h3>
        <div style={styles.checkboxGroup}>
          <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
          <label htmlFor="isFeatured" style={{ cursor: "pointer" }}>Featured Product</label>
        </div>
        <div style={styles.checkboxGroup}>
          <input type="checkbox" id="isNewArrival" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} />
          <label htmlFor="isNewArrival" style={{ cursor: "pointer" }}>New Arrival</label>
        </div>
        <div style={styles.checkboxGroup}>
          <input type="checkbox" id="isBestSeller" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} />
          <label htmlFor="isBestSeller" style={{ cursor: "pointer" }}>Best Seller</label>
        </div>
        <div style={styles.checkboxGroup}>
          <input type="checkbox" id="isTrending" name="isTrending" checked={formData.isTrending} onChange={handleChange} />
          <label htmlFor="isTrending" style={{ cursor: "pointer" }}>Trending</label>
        </div>
      </div>
    </>
  );
}
