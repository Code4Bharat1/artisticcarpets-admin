import React, { useState } from "react";
import { X, Upload } from "lucide-react";

export default function AddMaterialModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "", code: "", category: "", description: "",
    currentStock: 0, unit: "Kg", minStockLevel: 0, maxCapacity: "",
    warehouse: "", rackNumber: "", binNumber: "",
    supplier: "", purchasePricePerUnit: 0, purchaseDate: "", invoiceNumber: "", batchNumber: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        onSave();
        if (addAnother) {
          setFormData({
            name: "", code: "", category: "", description: "",
            currentStock: 0, unit: "Kg", minStockLevel: 0, maxCapacity: "",
            warehouse: "", rackNumber: "", binNumber: "",
            supplier: "", purchasePricePerUnit: 0, purchaseDate: "", invoiceNumber: "", batchNumber: "",
            remarks: ""
          });
        } else {
          onClose();
        }
      } else {
        alert(data.message || "Failed to create material");
      }
    } catch (err) {
      alert("Error saving material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Add Material</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>
        <div style={styles.modalBody}>
          <form id="material-form">
            <h3 style={styles.sectionTitle}>Basic Information</h3>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Material Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Material Code (Auto Generated)</label>
                <input type="text" name="code" placeholder="Leave blank to auto-generate" value={formData.code} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
                  <option value="">Select Category</option>
                  <option value="Wool Yarn">Wool Yarn</option>
                  <option value="Silk Yarn">Silk Yarn</option>
                  <option value="Cotton Yarn">Cotton Yarn</option>
                  <option value="Jute Yarn">Jute Yarn</option>
                  <option value="Synthetic Yarn">Synthetic Yarn</option>
                  <option value="Dyes & Chemicals">Dyes & Chemicals</option>
                  <option value="Backing Cloth">Backing Cloth</option>
                  <option value="Latex/Adhesive">Latex/Adhesive</option>
                  <option value="Binding Material">Binding Material</option>
                  <option value="Packaging Material">Packaging Material</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: "15px" }}>
              <label style={styles.label}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...styles.input, height: "60px" }} />
            </div>


            <h3 style={styles.sectionTitle}>Stock Information</h3>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Current Quantity</label>
                <input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Unit</label>
                <select name="unit" value={formData.unit} onChange={handleChange} style={styles.input}>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Meter">Meter</option>
                  <option value="Roll">Roll</option>
                  <option value="Piece">Piece</option>
                  <option value="Liter">Liter</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Minimum Stock Level</label>
                <input type="number" name="minStockLevel" value={formData.minStockLevel} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Maximum Capacity</label>
                <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Warehouse</label>
                <input type="text" name="warehouse" value={formData.warehouse} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Rack Number</label>
                <input type="text" name="rackNumber" value={formData.rackNumber} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Bin Number</label>
                <input type="text" name="binNumber" value={formData.binNumber} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <h3 style={styles.sectionTitle}>Purchase Information</h3>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Supplier</label>
                <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Purchase Price Per Unit</label>
                <input type="number" name="purchasePricePerUnit" value={formData.purchasePricePerUnit} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Purchase Date</label>
                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Invoice Number</label>
                <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Batch Number</label>
                <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <h3 style={styles.sectionTitle}>Notes</h3>
            <div>
              <label style={styles.label}>Additional Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} style={{ ...styles.input, height: "60px" }} />
            </div>
          </form>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.btnSecondary} onClick={onClose} disabled={loading}>Cancel</button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={styles.btnPrimary} onClick={(e) => handleSubmit(e, true)} disabled={loading}>
              {loading ? "Saving..." : "Save & Add Another"}
            </button>
            <button style={styles.btnPrimary} onClick={(e) => handleSubmit(e, false)} disabled={loading}>
              {loading ? "Saving..." : "Save Material"}
            </button>
          </div>
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
    backgroundColor: "var(--bg-primary)", width: "100%", maxWidth: "800px",
    borderRadius: "12px", display: "flex", flexDirection: "column", maxHeight: "90vh",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  modalHeader: {
    padding: "20px 24px", borderBottom: "1px solid var(--border-color)",
    display: "flex", justifyContent: "space-between", alignItems: "center"
  },
  modalBody: {
    padding: "24px", overflowY: "auto", flex: 1
  },
  modalFooter: {
    padding: "16px 24px", borderTop: "1px solid var(--border-color)",
    display: "flex", justifyContent: "space-between", gap: "12px", backgroundColor: "var(--bg-secondary)",
    borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px"
  },
  sectionTitle: {
    fontSize: "16px", fontWeight: "600", color: "var(--text-primary)",
    marginTop: "24px", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border-color)"
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "14px", outline: "none"
  },
  closeBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" },
  btnSecondary: {
    padding: "10px 16px", borderRadius: "6px", border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", cursor: "pointer", fontWeight: 500
  },
  btnPrimary: {
    padding: "10px 16px", borderRadius: "6px", border: "none",
    backgroundColor: "var(--primary-brand)", color: "white", cursor: "pointer", fontWeight: 500
  }
};
