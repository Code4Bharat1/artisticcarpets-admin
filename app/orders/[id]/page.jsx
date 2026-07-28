"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/api";
import {
  ArrowLeft, Calendar, User, Mail, Phone, MapPin, CreditCard,
  Truck, MessageSquare, DollarSign, Plus, AlertCircle,
  Clock, CheckCircle, XCircle, FileText, RefreshCw,
} from "lucide-react";

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.order);
        setNewStatus("");
        setStatusNote("");
        setTrackingNumber("");
        setCarrier("");
      }
    } catch (err) {
      setError("Failed to fetch order details. Ensure backend connection is active.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrderDetail(); }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const data = await apiRequest.patch(`/orders/${id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
        trackingNumber: newStatus === "shipped" ? trackingNumber : undefined,
        carrier: newStatus === "shipped" ? carrier : undefined,
      });
      if (data.success) {
        setOrder(data.order);
        setNewStatus("");
        setStatusNote("");
        setTrackingNumber("");
        setCarrier("");
        fetchOrderDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const data = await apiRequest.post(`/orders/${id}/notes`, { note: newNote });
      if (data.success) { setNewNote(""); fetchOrderDetail(); }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add note.");
    } finally {
      setAddingNote(false);
    }
  };

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    setProcessingRefund(true);
    try {
      const data = await apiRequest.post(`/orders/${id}/refund`, {
        reason: refundReason,
        amount: parseFloat(refundAmount) || order.total,
      });
      if (data.success) { setRefundReason(""); setRefundAmount(""); fetchOrderDetail(); }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit refund request.");
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleProcessRefundRequest = async (refundId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this refund request?`)) return;
    setProcessingRefund(true);
    try {
      const data = await apiRequest.patch(`/orders/${id}/refund`, {
        refundId, action,
        notes: actionNotes || undefined,
        transactionId: transactionId || undefined,
      });
      if (data.success) { setActionNotes(""); setTransactionId(""); fetchOrderDetail(); }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process refund request.");
    } finally {
      setProcessingRefund(false);
    }
  };

  const getAvailableTransitions = (currentStatus) => {
    if (["cancelled", "refunded"].includes(currentStatus)) return [];
    if (currentStatus === "returned") return ["refunded"];

    const forwardStatuses = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
    const currentIndex = forwardStatuses.indexOf(currentStatus);
    
    let allowed = forwardStatuses.filter((_, i) => currentIndex === -1 || i > currentIndex);
    if (currentStatus !== "delivered") allowed.push("cancelled");
    if (["shipped", "out_for_delivery", "delivered"].includes(currentStatus)) allowed.push("returned");
    
    return allowed;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <RefreshCw className="animate-spin" size={32} style={{ color: "var(--primary-brand)" }} />
          <span>Loading order details...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div style={styles.errorContainer}>
          <AlertCircle size={40} style={{ color: "var(--color-danger)" }} />
          <p>{error || "Order not found."}</p>
          <Link href="/orders" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Registry</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const transitions = getAvailableTransitions(order.status);

  return (
    <AdminLayout>
      <div style={styles.container}>
        <Link href="/orders" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Orders</span>
        </Link>

        <div style={styles.orderHeader}>
          <div style={styles.orderTitleWrap}>
            <h2 style={styles.orderTitle}>Order {order.orderNumber}</h2>
            <div style={styles.dateBadge}>
              <Calendar size={14} />
              <span>Placed {new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div style={styles.statusPills}>
            <span className={`badge badge-${order.status === "delivered" ? "success" : order.status === "pending" ? "warning" : order.status === "cancelled" ? "danger" : "info"}`} style={{ padding: "8px 16px" }}>
              Fulfillment: {order.status.replace(/_/g, " ")}
            </span>
            <span className={`badge badge-${order.payment?.status === "paid" ? "success" : order.payment?.status === "pending" ? "warning" : "danger"}`} style={{ padding: "8px 16px" }}>
              Payment: {order.payment?.status || "unknown"}
            </span>
          </div>
        </div>

        <div style={styles.contentLayout}>
          {/* Left Column */}
          <div style={styles.colLeft}>
            {/* Items */}
            <div style={styles.panel} className="glass">
              <h3 style={styles.panelTitle}>Purchased Items</h3>
              <div style={styles.itemsList}>
                {order.items?.map((item) => (
                  <div key={item.id || item._id} style={styles.itemRow}>
                    <div style={styles.itemImageContainer}>
                      {(() => {
                        const path = item.product?.thumbnail?.path || (item.product?.images && item.product?.images[0]?.path) || item.image || item.product?.mainImage?.path || item.thumbnail?.path || (item.images && item.images[0]?.path);
                        const imgSrc = (() => {
                          if (!path) return "https://images.unsplash.com/photo-1600166898232-2c9018300e0a?q=80&w=800&auto=format&fit=crop";
                          if (path.startsWith("http") || path.startsWith("data:")) return path;
                          if (path.startsWith("/")) return path.startsWith("/images") ? `http://localhost:5000${path}` : `http://localhost:5000/${path.substring(1)}`;
                          return `http://localhost:5000/${path}`;
                        })();
                        return (
                          <img 
                            src={imgSrc} 
                            alt={item.name || "Product"} 
                            style={styles.itemImage} 
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1600166898232-2c9018300e0a?q=80&w=800&auto=format&fit=crop"; }} 
                          />
                        );
                      })()}
                    </div>
                    <div style={styles.itemMeta}>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <p style={styles.itemSpecs}>
                        {item.size && `Size: ${item.size}`}
                        {item.material && ` • Material: ${item.material}`}
                        {item.color && ` • Color: ${item.color}`}
                        {item.sku && ` • SKU: ${item.sku}`}
                      </p>
                    </div>
                    <div style={styles.itemPriceWrap}>
                      <span style={styles.itemQty}>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                      <span style={styles.itemTotal}>{formatCurrency(item.totalPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.breakdown}>
                <div style={styles.breakdownRow}><span>Subtotal:</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div style={styles.breakdownRow}><span>Shipping Cost:</span><span>{formatCurrency(order.shippingCost || 0)}</span></div>
                {order.taxAmount > 0 && <div style={styles.breakdownRow}><span>Tax ({order.taxRate}%):</span><span>{formatCurrency(order.taxAmount)}</span></div>}
                {order.couponDiscount > 0 && <div style={{ ...styles.breakdownRow, color: "var(--color-success)" }}><span>Discount ({order.couponCode || "COUPON"}):</span><span>-{formatCurrency(order.couponDiscount)}</span></div>}
                <div style={styles.totalRow}><span>Grand Total:</span><span>{formatCurrency(order.total)}</span></div>
              </div>
            </div>

            {/* Customer & Address */}
            <div style={styles.addressesGrid}>
              <div style={styles.panel} className="glass">
                <h3 style={styles.panelTitle}>Customer Profile</h3>
                <div style={styles.customerCard}>
                  <div style={styles.custInfoLine}><User size={16} style={{ color: "var(--text-muted)" }} /><span style={{ fontWeight: "600" }}>{order.customerSnapshot?.name || "Guest Customer"}</span></div>
                  <div style={styles.custInfoLine}><Mail size={16} style={{ color: "var(--text-muted)" }} /><span>{order.customerSnapshot?.email || "No email provided"}</span></div>
                  <div style={styles.custInfoLine}><Phone size={16} style={{ color: "var(--text-muted)" }} /><span>{order.customerSnapshot?.phone || "No phone provided"}</span></div>
                </div>
              </div>
              <div style={styles.panel} className="glass">
                <h3 style={styles.panelTitle}>Delivery Address</h3>
                {order.shippingAddress ? (
                  <div style={styles.addressBlock}>
                    <p style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>{order.shippingAddress.firstName || order.customerSnapshot?.name || "Customer"} {order.shippingAddress.lastName || ""}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                ) : (<p style={{ color: "var(--text-muted)" }}>No shipping address provided.</p>)}
              </div>
            </div>

            {/* Timeline */}
            <div style={styles.panel} className="glass">
              <h3 style={styles.panelTitle}>Order Timeline</h3>
              <div style={styles.timelineList}>
                {order.timeline?.map((evt, idx) => (
                  <div key={evt.id || idx} style={styles.timelineItem}>
                    <div style={styles.timelineIndicator}>
                      <div style={styles.timelineDot}></div>
                      {idx < order.timeline.length - 1 && <div style={styles.timelineLine}></div>}
                    </div>
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineHeader}>
                        <span style={styles.timelineStatus}>{evt.status.replace(/_/g, " ")}</span>
                        <span style={styles.timelineTime}>{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                      <p style={styles.timelineMsg}>{evt.message}</p>
                      {evt.updatedBy && <span style={styles.timelineAuthor}>Updated by: {evt.updatedBy.firstName} {evt.updatedBy.lastName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.colRight}>
            {/* Status Controls */}
            <div style={styles.panel} className="glass">
              <h3 style={styles.panelTitle}>Fulfillment Controls</h3>
              {transitions.length === 0 ? (
                <div style={styles.terminalStateBox}>
                  <CheckCircle size={20} style={{ color: "var(--color-success)" }} />
                  <span>Order is in a terminal status ({order.status}). No further transitions are possible.</span>
                </div>
              ) : (
                <form onSubmit={handleStatusUpdate} style={styles.statusForm}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="statusSelector">Change Status To</label>
                    <select id="statusSelector" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="form-select" required>
                      <option value="">Select Next Status</option>
                      {transitions.map((t) => (<option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>))}
                    </select>
                  </div>
                  {newStatus === "shipped" && (
                    <div style={styles.shippingInputs} className="fade-in">
                      <div className="form-group"><label className="form-label" htmlFor="carrierInput">Shipping Carrier</label><input id="carrierInput" type="text" placeholder="DHL, FedEx, etc." value={carrier} onChange={(e) => setCarrier(e.target.value)} className="form-input" required /></div>
                      <div className="form-group"><label className="form-label" htmlFor="trackingInput">Tracking Number</label><input id="trackingInput" type="text" placeholder="TRK123456789" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="form-input" required /></div>
                    </div>
                  )}
                  <div className="form-group"><label className="form-label" htmlFor="statusNote">Fulfillment Note (Optional)</label><textarea id="statusNote" placeholder="Describe status change context..." value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="form-input" rows={3} style={{ resize: "none" }} /></div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={updatingStatus}>
                    {updatingStatus ? "Processing..." : "Update Order State"}
                  </button>
                </form>
              )}
              {order.shipping?.trackingNumber && (
                <div style={styles.trackingCard}>
                  <Truck size={18} style={{ color: "var(--primary-brand)" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary-brand)" }}>Carrier: {order.shipping.carrier}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Tracking: {order.shipping.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div style={styles.panel} className="glass">
              <h3 style={styles.panelTitle}>Internal Notes</h3>
              <p style={styles.panelDesc}>Visible only to team administrators</p>
              <div style={styles.notesContainer}>
                {order.internalNotes?.length === 0 ? (
                  <p style={styles.emptyNotes}>No internal logs recorded.</p>
                ) : (
                  <div style={styles.notesList}>
                    {order.internalNotes?.map((note) => (
                      <div key={note.id || note._id} style={styles.noteItem}>
                        <p style={styles.noteBody}>{note.note}</p>
                        <div style={styles.noteMeta}>
                          <span>{note.addedBy?.firstName || "System"}</span>
                          <span>{new Date(note.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleAddNote} style={styles.noteForm}>
                  <textarea placeholder="Record an internal comment..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="form-input" rows={2} style={{ resize: "none", fontSize: "13px" }} required />
                  <button type="submit" className="btn btn-secondary" style={styles.addNoteBtn} disabled={addingNote}>
                    <Plus size={14} /><span>Add Log</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Refunds */}
            {["delivered", "returned", "refunded"].includes(order.status) && (
              <div style={styles.panel} className="glass">
                <h3 style={styles.panelTitle}>Refund Controls</h3>
                {order.refunds && order.refunds.length > 0 ? (
                  <div style={styles.refundsList}>
                    {order.refunds.map((ref) => (
                      <div key={ref._id} style={styles.refundRequestItem}>
                        <div style={styles.refundHeader}>
                          <span style={styles.refundAmountLabel}>Amount: {formatCurrency(ref.amount)}</span>
                          <span className={`badge badge-${ref.status === "processed" ? "success" : ref.status === "requested" ? "warning" : "danger"}`}>{ref.status}</span>
                        </div>
                        <p style={styles.refundReason}><strong>Reason:</strong> {ref.reason}</p>
                        {ref.status === "requested" && (
                          <div style={styles.refundActionsForm}>
                            <div className="form-group" style={{ marginBottom: "8px" }}><input type="text" placeholder="Transaction Id..." value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="form-input" style={{ padding: "8px", fontSize: "12px" }} /></div>
                            <div className="form-group" style={{ marginBottom: "12px" }}><input type="text" placeholder="Notes (optional)..." value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} className="form-input" style={{ padding: "8px", fontSize: "12px" }} /></div>
                            <div style={styles.refundButtonRow}>
                              <button onClick={() => handleProcessRefundRequest(ref._id, "approve")} className="btn btn-primary" style={styles.actionRefundBtn} disabled={processingRefund}>Approve</button>
                              <button onClick={() => handleProcessRefundRequest(ref._id, "reject")} className="btn btn-secondary" style={{ ...styles.actionRefundBtn, color: "var(--color-danger)" }} disabled={processingRefund}>Reject</button>
                            </div>
                          </div>
                        )}
                        {ref.status === "processed" && (
                          <div style={styles.refundProcessedBox}>
                            <p>Processed At: {new Date(ref.processedAt).toLocaleDateString()}</p>
                            {ref.transactionId && <p>Transaction: <code>{ref.transactionId}</code></p>}
                            {ref.notes && <p>Notes: {ref.notes}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : order.status === "returned" ? (
                  <form onSubmit={handleRequestRefund} style={styles.refundRequestForm}>
                    <p style={styles.panelDesc}>Submit refund request on behalf of customer:</p>
                    <div className="form-group"><label className="form-label" htmlFor="refundAmount">Refund Amount</label><input id="refundAmount" type="number" placeholder={order.total} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="form-input" /></div>
                    <div className="form-group"><label className="form-label" htmlFor="refundReason">Reason</label><input id="refundReason" type="text" placeholder="Customer returned items..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="form-input" required /></div>
                    <button type="submit" className="btn btn-danger" style={{ width: "100%" }} disabled={processingRefund}>Request Refund</button>
                  </form>
                ) : (
                  <p style={styles.panelDesc}>Refunds can only be requested once order status is transitioned to Returned.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "16px" },
  loadingContainer: { height: "calc(100vh - var(--header-height) - 80px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "var(--text-secondary)" },
  errorContainer: { padding: "80px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" },
  backLink: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)", fontWeight: "500", alignSelf: "flex-start" },
  orderHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  orderTitleWrap: { display: "flex", flexDirection: "column", gap: "6px" },
  orderTitle: { fontSize: "32px", fontWeight: "700" },
  dateBadge: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" },
  statusPills: { display: "flex", gap: "12px" },
  contentLayout: { display: "flex", gap: "32px", alignItems: "flex-start" },
  colLeft: { flex: 1, display: "flex", flexDirection: "column", gap: "32px" },
  colRight: { width: "360px", display: "flex", flexDirection: "column", gap: "32px", flexShrink: 0 },
  panel: { padding: "28px", borderRadius: "var(--border-radius)", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" },
  panelTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "16px" },
  panelDesc: { fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" },
  itemsList: { display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px" },
  itemRow: { display: "flex", alignItems: "center", gap: "16px" },
  itemImageContainer: { width: "60px", height: "75px", borderRadius: "var(--border-radius-sm)", backgroundColor: "var(--bg-tertiary)", overflow: "hidden", flexShrink: 0, border: "1px solid var(--border-color)" },
  itemImage: { width: "100%", height: "100%", objectFit: "cover" },
  itemImageFallback: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--text-muted)" },
  itemMeta: { flex: 1 },
  itemName: { fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" },
  itemSpecs: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" },
  itemPriceWrap: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" },
  itemQty: { fontSize: "13px", color: "var(--text-secondary)" },
  itemTotal: { fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" },
  breakdown: { paddingTop: "24px", display: "flex", flexDirection: "column", gap: "10px" },
  breakdownRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "700", color: "var(--primary-brand)", borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "6px" },
  addressesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  customerCard: { display: "flex", flexDirection: "column", gap: "12px" },
  custInfoLine: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" },
  addressBlock: { fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" },
  timelineList: { display: "flex", flexDirection: "column", paddingLeft: "8px" },
  timelineItem: { display: "flex", gap: "16px" },
  timelineIndicator: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 },
  timelineDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--primary-brand)", boxShadow: "0 0 6px var(--primary-brand-glow)", marginTop: "6px" },
  timelineLine: { width: "2px", flex: 1, backgroundColor: "var(--border-color)", minHeight: "40px" },
  timelineContent: { paddingBottom: "24px", flex: 1 },
  timelineHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
  timelineStatus: { fontSize: "14px", fontWeight: "600", textTransform: "uppercase", color: "var(--text-primary)", letterSpacing: "0.02em" },
  timelineTime: { fontSize: "12px", color: "var(--text-muted)" },
  timelineMsg: { fontSize: "13px", color: "var(--text-secondary)" },
  timelineAuthor: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" },
  terminalStateBox: { display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(21, 128, 61, 0.08)", border: "1px solid rgba(21, 128, 61, 0.2)", borderRadius: "var(--border-radius-sm)", padding: "16px", fontSize: "13px", color: "var(--color-success)", lineHeight: "1.4" },
  statusForm: { display: "flex", flexDirection: "column" },
  shippingInputs: { display: "flex", flexDirection: "column", gap: "8px", padding: "16px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", marginBottom: "16px" },
  trackingCard: { display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--primary-brand-light)", border: "1px solid rgba(108, 29, 27, 0.2)", borderRadius: "var(--border-radius-sm)", padding: "14px 16px", marginTop: "20px" },
  notesContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  emptyNotes: { fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" },
  notesList: { display: "flex", flexDirection: "column", gap: "12px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" },
  noteItem: { backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "10px 12px" },
  noteBody: { fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.4" },
  noteMeta: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" },
  noteForm: { display: "flex", flexDirection: "column", gap: "8px" },
  addNoteBtn: { alignSelf: "flex-end", padding: "8px 12px", fontSize: "12px" },
  refundsList: { display: "flex", flexDirection: "column", gap: "16px" },
  refundRequestItem: { backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "16px" },
  refundHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  refundAmountLabel: { fontSize: "14px", fontWeight: "600", color: "var(--primary-brand)" },
  refundReason: { fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" },
  refundActionsForm: { borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "8px" },
  refundButtonRow: { display: "flex", gap: "12px" },
  actionRefundBtn: { flex: 1, padding: "8px", fontSize: "12px" },
  refundProcessedBox: { fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6", borderTop: "1px solid var(--border-color)", paddingTop: "8px", marginTop: "8px" },
  refundRequestForm: { display: "flex", flexDirection: "column" },
};
