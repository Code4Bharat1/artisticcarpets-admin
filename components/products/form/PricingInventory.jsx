"use client";

import React from "react";
import { formStyles as styles } from "./FormStyles";
import { Plus, Trash2 } from "lucide-react";

export default function PricingInventory({ formData, setFormData, handleChange }) {
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { size: "", price: "", discountPrice: "", stock: "" }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...(prev.variants || [])];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const variants = formData.variants || [];

  return (
    <div style={styles.card}>
      <h3 style={{...styles.cardTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span>Pricing & Inventory (Variants)</span>
        <button 
          type="button" 
          onClick={addVariant} 
          style={{ ...styles.actionBtn, width: 'auto', margin: 0, padding: '6px 12px', fontSize: '12px' }}
        >
          <Plus size={14} style={{ marginRight: '4px' }} /> Add Variant
        </button>
      </h3>
      
      {variants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "4px" }}>
          <p>No variants added. Please add at least one variant for size and pricing.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {variants.map((variant, index) => (
            <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1fr 40px", gap: "12px", alignItems: "end", backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ marginBottom: 0 }}>
                <label style={{...styles.label, fontSize: '11px'}}>Size *</label>
                <input 
                  required 
                  type="text" 
                  value={variant.size} 
                  onChange={(e) => updateVariant(index, 'size', e.target.value)} 
                  style={{...styles.input, padding: '8px'}} 
                  placeholder="e.g. 2-5 X 5-0" 
                />
              </div>
              <div style={{ marginBottom: 0 }}>
                <label style={{...styles.label, fontSize: '11px'}}>Price (₹) *</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={variant.price} 
                  onChange={(e) => updateVariant(index, 'price', e.target.value)} 
                  style={{...styles.input, padding: '8px'}} 
                  placeholder="0.00" 
                />
              </div>
              <div style={{ marginBottom: 0 }}>
                <label style={{...styles.label, fontSize: '11px'}}>Discount (₹)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={variant.discountPrice || ''} 
                  onChange={(e) => updateVariant(index, 'discountPrice', e.target.value)} 
                  style={{...styles.input, padding: '8px'}} 
                  placeholder="0" 
                />
              </div>
              <div style={{ marginBottom: 0 }}>
                <label style={{...styles.label, fontSize: '11px'}}>Stock *</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  value={variant.stock} 
                  onChange={(e) => updateVariant(index, 'stock', e.target.value)} 
                  style={{...styles.input, padding: '8px'}} 
                  placeholder="0" 
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeVariant(index)}
                style={{ ...styles.removeBtn, padding: '8px', height: '35px', justifyContent: 'center' }}
                title="Remove Variant"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Global SKU for the product */}
      <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px", color: "var(--text-primary)" }}>Global Settings</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Product SKU *</label>
            <input required type="text" name="sku" value={formData.sku} onChange={handleChange} style={styles.input} placeholder="Auto-generated if empty" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Discount Price (Optional) (₹)</label>
            <input type="number" min="0" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleChange} style={styles.input} placeholder="Overrides variant prices" />
          </div>
        </div>
      </div>
    </div>
  );
}
