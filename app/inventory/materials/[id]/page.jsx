"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Plus, Minus, ArrowRightLeft, Activity, Info, Truck, Package, RotateCcw } from "lucide-react";
import UpdateStockModal from "../../components/UpdateStockModal";

export default function MaterialDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [material, setMaterial] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const fetchMaterialDetails = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/materials/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("artistic_carpets_admin_token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setMaterial(data.data.material);
        setMovements(data.data.movements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMaterialDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "40px", textAlign: "center" }}>Loading material details...</div>
      </AdminLayout>
    );
  }

  if (!material) {
    return (
      <AdminLayout>
        <div style={{ padding: "40px", textAlign: "center" }}>Material not found</div>
      </AdminLayout>
    );
  }

  const getMovementIcon = (type) => {
    switch (type) {
      case "Add Stock": return <Plus size={16} color="var(--success)" />;
      case "Consume Stock": return <Minus size={16} color="var(--danger)" />;
      case "Transfer Stock": return <ArrowRightLeft size={16} color="var(--primary-color)" />;
      default: return <RotateCcw size={16} color="var(--text-muted)" />;
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button style={styles.backBtn} onClick={() => router.push("/inventory")}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 style={styles.title}>{material.name}</h2>
              <p style={styles.subtitle}>Material Code: {material.code}</p>
            </div>
          </div>
          <div>
            <button style={styles.btnPrimary} onClick={() => setIsStockModalOpen(true)}>
              Update Stock
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Left Column */}
          <div style={styles.leftCol}>
            
            {/* Info Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Info size={18} /> Basic Information
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Category:</span>
                  <span style={styles.infoValue}>{material.category || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Unit:</span>
                  <span style={styles.infoValue}>{material.unit}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Status:</span>
                  <span style={material.status === "active" ? styles.badgeGreen : styles.badgeRed}>
                    {material.status}
                  </span>
                </div>
                {material.description && (
                  <div style={{ marginTop: "15px" }}>
                    <span style={styles.infoLabel}>Description:</span>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "var(--text-primary)" }}>{material.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Warehouse Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Package size={18} /> Warehouse Information
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Warehouse:</span>
                  <span style={styles.infoValue}>{material.warehouse || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Rack Number:</span>
                  <span style={styles.infoValue}>{material.rackNumber || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Bin Number:</span>
                  <span style={styles.infoValue}>{material.binNumber || "-"}</span>
                </div>
              </div>
            </div>

            {/* Supplier Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Truck size={18} /> Supplier & Purchase Information
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Supplier:</span>
                  <span style={styles.infoValue}>{material.supplier || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Purchase Price:</span>
                  <span style={styles.infoValue}>₹{material.purchasePricePerUnit} / {material.unit}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Value:</span>
                  <span style={styles.infoValue}>₹{(material.purchasePricePerUnit * material.currentStock).toLocaleString()}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Latest Invoice:</span>
                  <span style={styles.infoValue}>{material.invoiceNumber || "-"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div style={styles.rightCol}>
            
            {/* Stock Overview Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Activity size={18} /> Current Stock Overview
              </div>
              <div style={styles.cardBody}>
                <div style={styles.stockOverview}>
                  <div style={styles.stockMain}>
                    <span style={styles.stockNumber}>{material.currentStock}</span>
                    <span style={styles.stockUnit}>{material.unit}</span>
                  </div>
                  <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
                    <div>
                      <span style={styles.infoLabel}>Min Stock:</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold" }}>{material.minStockLevel}</span>
                    </div>
                    <div>
                      <span style={styles.infoLabel}>Max Capacity:</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold" }}>{material.maxCapacity || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Movement History Card */}
            <div style={{ ...styles.card, flex: 1 }}>
              <div style={styles.cardHeader}>
                Stock Movement History
              </div>
              <div style={{ padding: "0" }}>
                {movements.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    No stock movements recorded yet.
                  </div>
                ) : (
                  <table className="custom-table" style={{ border: "none", marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Balance</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((mov) => (
                        <tr key={mov._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                              {getMovementIcon(mov.type)}
                              {mov.type}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                              {mov.reason || "-"}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: mov.quantity > 0 ? "var(--success)" : "var(--text-primary)" }}>
                            {mov.quantity > 0 ? "+" : ""}{mov.quantity}
                          </td>
                          <td style={{ fontWeight: "bold", fontSize: "13px" }}>{mov.newStock}</td>
                          <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {new Date(mov.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {isStockModalOpen && (
        <UpdateStockModal 
          material={material} 
          onClose={() => setIsStockModalOpen(false)} 
          onSave={() => {
            setIsStockModalOpen(false);
            fetchMaterialDetails();
          }} 
        />
      )}
    </AdminLayout>
  );
}

const styles = {
  container: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { margin: "0 0 5px 0", fontSize: "24px", color: "var(--text-primary)" },
  subtitle: { margin: 0, fontSize: "14px", color: "var(--text-muted)" },
  backBtn: { background: "none", border: "1px solid var(--border-color)", borderRadius: "8px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" },
  btnPrimary: { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary-brand)", color: "white", fontWeight: "600", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "24px" },
  rightCol: { display: "flex", flexDirection: "column", gap: "24px" },
  card: { backgroundColor: "var(--bg-primary)", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", overflow: "hidden" },
  cardHeader: { padding: "16px 20px", borderBottom: "1px solid var(--border-color)", fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", backgroundColor: "var(--bg-secondary)", display: "flex", alignItems: "center", gap: "10px" },
  cardBody: { padding: "20px" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color)" },
  infoLabel: { color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" },
  infoValue: { color: "var(--text-primary)", fontSize: "14px", fontWeight: "500" },
  badgeGreen: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block", color: "var(--success)", backgroundColor: "rgba(16, 185, 129, 0.1)" },
  badgeRed: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block", color: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.1)" },
  stockOverview: { textAlign: "center", padding: "10px 0" },
  stockMain: { fontSize: "48px", fontWeight: "bold", color: "var(--primary-color)", lineHeight: "1" },
  stockUnit: { fontSize: "18px", color: "var(--text-muted)", marginLeft: "8px" },
};
