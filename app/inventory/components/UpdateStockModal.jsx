import React, { useState } from "react";
import { X } from "lucide-react";

export default function UpdateStockModal({ material, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: "Add Stock",
    quantity: "",
    reason: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/materials/${material._id}/stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}`
        },
        body: JSON.stringify({
          type: formData.type,
          quantity: Number(formData.quantity),
          reason: formData.reason,
          remarks: formData.remarks
        })
      });
      const data = await res.json();
      
      if (data.success) {
        onSave(); // Refresh the list
      } else {
        alert(data.message || "Failed to update stock");
      }
    } catch (err) {
      alert("Error updating stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px" }}>Update Stock: {material.name}</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
              Current Stock: <strong style={{ color: "var(--text-primary)" }}>{material.currentStock} {material.unit}</strong>
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>
        <div style={styles.modalBody}>
          <form id="stock-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={styles.label}>Operation Type *</label>
              <select name="type" required value={formData.type} onChange={handleChange} style={styles.input}>
                <option value="Add Stock">Add Stock</option>
                <option value="Consume Stock">Consume Stock</option>
                <option value="Adjust Stock">Adjust Stock</option>
                <option value="Transfer Stock">Transfer Stock</option>
              </select>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={styles.label}>
                {formData.type === "Adjust Stock" ? "New Total Quantity *" : "Quantity *"}
              </label>
              <input type="number" name="quantity" required min="1" value={formData.quantity} onChange={handleChange} style={styles.input} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={styles.label}>Reason</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleChange} style={styles.input} placeholder="e.g., Restock, Order Fulfillment, Audit..." />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={styles.label}>Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} style={{ ...styles.input, height: "60px" }} />
            </div>
          </form>
        </div>
        <div style={styles.modalFooter}>
          <button type="button" style={styles.btnSecondary} onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" form="stock-form" style={styles.btnPrimary} disabled={loading}>
            {loading ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    padding: "20px"
  },
  modalContent: {
    backgroundColor: "var(--bg-primary)", width: "100%", maxWidth: "500px",
    borderRadius: "12px", display: "flex", flexDirection: "column",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  modalHeader: {
    padding: "20px 24px", borderBottom: "1px solid var(--border-color)",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start"
  },
  modalBody: {
    padding: "24px"
  },
  modalFooter: {
    padding: "16px 24px", borderTop: "1px solid var(--border-color)",
    display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "var(--bg-secondary)",
    borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px"
  },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "14px", outline: "none"
  },
  closeBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginTop: "4px" },
  btnSecondary: {
    padding: "10px 16px", borderRadius: "6px", border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", cursor: "pointer", fontWeight: 500
  },
  btnPrimary: {
    padding: "10px 16px", borderRadius: "6px", border: "none",
    backgroundColor: "var(--primary-brand)", color: "white", cursor: "pointer", fontWeight: 500
  }
};
