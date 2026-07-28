"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/api";
import {
  ArrowLeft, User, MapPin, 
  RefreshCw, CheckCircle, XCircle, FileText, Package
} from "lucide-react";

export default function RefundDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRefundDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest.get(`/refunds/${id}`);
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      setError("Failed to fetch refund details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRefundDetail(); }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const data = await apiRequest.patch(`/refunds/${id}/status`, {
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });
      if (data.success) {
        setOrder(data.order);
        setNewStatus("");
        setAdminNotes("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update refund status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.centerContainer}>
          <div className="spin" style={styles.loader}><RefreshCw size={32} /></div>
          <p>Loading refund details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div style={styles.centerContainer}>
          <p style={{ color: "var(--color-danger)" }}>{error || "Order not found"}</p>
          <Link href="/refunds" className="btn btn-secondary" style={{ marginTop: "16px" }}>Back to Refunds</Link>
        </div>
      </AdminLayout>
    );
  }

  const { refund } = order;

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/refunds" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Refunds</span>
          </Link>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>Refund for Order #{order.orderNumber}</h1>
            <span style={{...styles.badge, ...styles[`badge_${refund?.status?.toLowerCase()}`]}}>
              {refund?.status || "None"}
            </span>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Main Info Column */}
          <div style={styles.mainCol}>
            
            {/* Refund Details */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}><FileText size={18} /> Request Details</h2>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Requested At</p>
                    <p style={styles.infoValue}>{formatDate(refund?.requestedAt)}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Refund Amount</p>
                    <p style={styles.infoValue} className="text-primary">{formatCurrency(order.total)}</p>
                  </div>
                </div>
                
                <div style={styles.divider}></div>
                
                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>Customer Reason</p>
                  <p style={styles.infoValue}>{refund?.reason || "No reason provided."}</p>
                </div>
                
                {refund?.adminNotes && (
                  <>
                    <div style={styles.divider}></div>
                    <div style={styles.infoItem}>
                      <p style={styles.infoLabel}>Admin Notes</p>
                      <p style={styles.infoValue}>{refund.adminNotes}</p>
                    </div>
                  </>
                )}
                
                {refund?.processedAt && (
                  <>
                    <div style={styles.divider}></div>
                    <div style={styles.infoItem}>
                      <p style={styles.infoLabel}>Processed At</p>
                      <p style={styles.infoValue}>{formatDate(refund.processedAt)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Refund Policy snapshot */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}><FileText size={18} /> Refund Policy Snapshot</h2>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Refund Window</p>
                    <p style={styles.infoValue}>{refund?.refundWindow} Days</p>
                  </div>
                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Shipping Responsibility</p>
                    <p style={styles.infoValue}>{refund?.shippingResponsibility || "Customer"}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <p style={styles.infoLabel}>Required Condition</p>
                    <p style={styles.infoValue}>{refund?.requiredCondition || "Unused"}</p>
                  </div>
                </div>
                <div style={styles.divider}></div>
                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>Policy Description</p>
                  <p style={styles.infoValue}>{refund?.description || "N/A"}</p>
                </div>
              </div>
            </div>
            
            {/* Items Column */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}><Package size={18} /> Order Items</h2>
              </div>
              <div style={styles.cardBody} >
                <table style={styles.itemTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.productCell}>
                            <img src={item.image || "/placeholder.jpg"} alt={item.title} style={styles.productImg} />
                            <div>
                              <p style={styles.productTitle}>{item.title}</p>
                              {item.sku && <p style={styles.productSku}>SKU: {item.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>{item.quantity}</td>
                        <td style={styles.td}>{formatCurrency(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div style={styles.sideCol}>
            
            {/* Update Status */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}><RefreshCw size={18} /> Process Refund</h2>
              </div>
              <div style={styles.cardBody}>
                <form onSubmit={handleStatusUpdate}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Action</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="form-select"
                      style={styles.select}
                      required
                    >
                      <option value="">Select Action...</option>
                      <option value="Approved">Approve Refund</option>
                      <option value="Rejected">Reject Refund</option>
                      <option value="Refunded">Mark as Refunded</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Admin Notes (Optional)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      style={styles.textarea}
                      placeholder="Add an internal note or reason for customer..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "10px" }}
                    disabled={updatingStatus || !newStatus}
                  >
                    {updatingStatus ? "Processing..." : "Update Status"}
                  </button>
                </form>
              </div>
            </div>

            {/* Customer Details */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}><User size={18} /> Customer Info</h2>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.customerInfoBlock}>
                  <p style={styles.infoLabel}>Name</p>
                  <p style={styles.infoValue}>{order.customerSnapshot?.name}</p>
                </div>
                <div style={styles.customerInfoBlock}>
                  <p style={styles.infoLabel}>Email</p>
                  <p style={styles.infoValue}>{order.customerSnapshot?.email}</p>
                </div>
                <div style={styles.customerInfoBlock}>
                  <p style={styles.infoLabel}>Phone</p>
                  <p style={styles.infoValue}>{order.customerSnapshot?.phone}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </AdminLayout>
  );
}

const styles = {
  container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  centerContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  loader: { color: "var(--primary-brand)", marginBottom: "16px" },
  
  header: { marginBottom: "24px" },
  backLink: { display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px", marginBottom: "16px", fontWeight: "500" },
  titleRow: { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  title: { fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-serif)" },
  
  badge: { padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  badge_pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
  badge_approved: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
  badge_rejected: { backgroundColor: "#FEE2E2", color: "#B91C1C" },
  badge_refunded: { backgroundColor: "#D1FAE5", color: "#065F46" },
  badge_none: { backgroundColor: "#F3F4F6", color: "#374151" },
  
  grid: { display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px", alignItems: "start" },
  mainCol: { display: "flex", flexDirection: "column", gap: "24px" },
  sideCol: { display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "24px" },
  
  card: { backgroundColor: "var(--bg-primary)", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", overflow: "hidden" },
  cardHeader: { padding: "16px 20px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-secondary)" },
  cardTitle: { margin: 0, fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" },
  cardBody: { padding: "20px" },
  
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  infoItem: { marginBottom: "0" },
  infoLabel: { fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" },
  infoValue: { fontSize: "15px", color: "var(--text-primary)", margin: 0, fontWeight: "500", wordBreak: "break-word" },
  
  divider: { height: "1px", backgroundColor: "var(--border-color)", margin: "20px 0" },
  
  itemTable: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 20px", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" },
  td: { padding: "16px 20px", borderBottom: "1px solid var(--border-color)" },
  tr: { ":last-child": { borderBottom: "none" } },
  
  productCell: { display: "flex", alignItems: "center", gap: "12px" },
  productImg: { width: "48px", height: "48px", objectFit: "cover", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)" },
  productTitle: { margin: "0 0 4px 0", fontWeight: "500", fontSize: "14px", color: "var(--text-primary)" },
  productSku: { margin: 0, fontSize: "12px", color: "var(--text-muted)" },
  
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "8px" },
  select: { width: "100%", padding: "10px 12px", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "80px", resize: "vertical" },
  
  customerInfoBlock: { marginBottom: "16px", ":last-child": { marginBottom: 0 } },
};
